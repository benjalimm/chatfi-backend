import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import { ExtractedData } from '../../schema/ExtractedData';
import { StatementMetadata } from '../../schema/Metadata';
import {
  GEN_EXTRACT_OR_MOVE_ON_PROMPT,
  GEN_RANK_SEGMENTS_PROMPT,
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT
} from './SharedPrompts';
import { extractSingularJSONFromString } from './Utils';
import path from 'path';
import * as fs from 'fs';

const MAX_STATEMENT_TO_TRAVERSE = 5;
const MAX_SEGMENTS_TO_TRAVERSE = 5;

type PertinentSegmentsData = { statement: string; segments: string[] };

export default class WaterfallDataTraversalController extends BaseDataTraversalContoller {
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    this.listOfStatements = reportMetadata.statements;
  }

  async generateFinalPrompt(query: string): Promise<string> {
    // 1. Get list of pertinent statements
    const extractedStatementsResponse =
      await this.extractRelevantStatementsFromQuery(
        MAX_STATEMENT_TO_TRAVERSE,
        query
      );

    // 2. Get list of of segments for each statement
    const listOfRelevantSegments =
      await this.extractRelevantSegmentsFromStatements(
        extractedStatementsResponse.statements,
        query
      );

    // 2.1 - Flatten list of segments into list of segments string
    let listOfSegmentsString = ``;
    listOfRelevantSegments.forEach((segmentsData) => {
      segmentsData.segments.forEach((segment) => {
        listOfSegmentsString += `${segmentsData.statement}/${segment}\n`;
      });
    });

    // 3. Ask LLM to rank segments from most likely to least likely to find pertinent information
    const llmResponse = await this.llmController.executePrompt(
      GEN_RANK_SEGMENTS_PROMPT(listOfSegmentsString, query)
    );

    // 4. Parse JSON string as data type
    const extractedJSONString = extractSingularJSONFromString(llmResponse);
    const segmentData = JSON.parse(extractedJSONString) as {
      statementSegments: string[]; // NOTE: This is a list of strings in the form of "statement/segment"
    };

    const extractedData: ExtractedData[] = []; // Keep reference of extracted data

    // 5. Iterate through each statement segment
    for (const statementSegment of segmentData.statementSegments) {
      const extension = path.extname(statementSegment);
      const fullFilePath = `${this.dataFilePath}/${statementSegment}`;
      let stringifiedData = ``;

      const statement = statementSegment.split('/')[0];
      const segment = statementSegment.split('/')[1];

      let DATA_EXTRACTION_PROMPT = ``;
      if (extension === '.json') {
        const jsonSegment = require(fullFilePath);
        stringifiedData = JSON.stringify(jsonSegment);

        // 5.1 Set data extraction prompt to JSON data extraction prompt
        DATA_EXTRACTION_PROMPT = GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT(
          segment,
          stringifiedData,
          query
        );
      } else {
        const txtSegment = fs.readFileSync(fullFilePath, 'utf8');
        stringifiedData = txtSegment;

        // 5.2 Set data extraction prompt to TXT data extraction prompt
        DATA_EXTRACTION_PROMPT = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(
          segment,
          stringifiedData,
          query
        );
      }

      let awaitingResult: Promise<string>;
      if (extractedData.length > 0) {
        // 6. If we have extracted data, ask LLM if we should extract more data or move on
        const stringifiedExtractedDataSoFar =
          this.combineExtractedDataToString(extractedData);

        awaitingResult = this.llmController.executePrompt(
          GEN_EXTRACT_OR_MOVE_ON_PROMPT(
            stringifiedExtractedDataSoFar,
            DATA_EXTRACTION_PROMPT,
            query
          )
        );
      } else {
        // 7. If we do not have extracted data, just extract data
        awaitingResult = this.llmController.executePrompt(
          DATA_EXTRACTION_PROMPT
        );
      }

      // 8. Extract result from string
      const result = await awaitingResult;
      const extractedJSONString = extractSingularJSONFromString(result);
      const resultJSON = JSON.parse(extractedJSONString);

      // 9. We see if LLM added more data or decided to escape
      if (resultJSON.escape === undefined) {
        // 9.1 - LLM added more data, keep going with data extracton.
        extractedData.push({
          statement,
          segment,
          data: result
        });
      } else {
        // 9.2 - LLM decided to escape, break loop, causing data extracted so far to be returned.
        break;
      }
    }
    // 10. Combine extracted data into final prompt;
    return this.combineExtractedDataToString(extractedData);
  }
  private async extractRelevantSegmentsFromStatements(
    statements: string[],
    query: string
  ): Promise<PertinentSegmentsData[]> {
    const extractedSegments: PertinentSegmentsData[] = [];
    for (const statementFile of statements) {
      try {
        // 2.1 - Get metadata for statement
        const statementMetadata =
          require(`${this.dataFilePath}/${statementFile}/metadata.json`) as StatementMetadata;

        // 3. Ask LLM which segments it would look at
        const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
          MAX_SEGMENTS_TO_TRAVERSE,
          statementMetadata.segments,
          query
        );
        const segmentPromptJsonString = await this.llmController.executePrompt(
          SEGMENT_PROMPT
        );

        const extractedSegmentPromptJsonString =
          await extractSingularJSONFromString(segmentPromptJsonString);

        // 4. Parse JSON string as data type
        const segmentPromptJson = JSON.parse(
          extractedSegmentPromptJsonString
        ) as StatementMetadata;

        // Push extracted data
        extractedSegments.push({
          statement: statementFile,
          segments: segmentPromptJson.segments
        });
      } catch (e) {
        console.log(`Caught error at segment level: ${e}\n...Continuing loop`);
        continue;
      }
    }
    return extractedSegments;
  }
}
