import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import { ExtractedData } from '../../schema/ExtractedData';
import { DocumentMetadata, StatementMetadata } from '../../schema/Metadata';
import {
  GEN_EXTRACT_OR_MOVE_ON_PROMPT,
  GEN_RANK_SEGMENTS_PROMPT,
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT
} from './Prompts';
import { extractJSONFromString, readJSON, readTxt } from './Utils';
import path from 'path';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';

const MAX_STATEMENT_TO_TRAVERSE = 3;
const MAX_SEGMENTS_TO_TRAVERSE = 3;

type PertinentSegmentsData = { statement: string; segments: string[] };

export default class WaterfallDataTraversalController
  extends BaseDataTraversalContoller
  implements LLMDataTraversalController
{
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    const documentMetadata = readJSON(
      dataFilePath + '/metadata.json'
    ) as DocumentMetadata;
    this.listOfStatements = documentMetadata.statements;
  }

  async generateFinalPrompt(query: string): Promise<DataTraversalPromptResult> {
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
    let segmentCount = 0;
    listOfRelevantSegments.forEach((segmentsData) => {
      segmentsData.segments.forEach((segment) => {
        segmentCount += 1;
        listOfSegmentsString += `${segmentsData.statement}/${segment}\n`;
      });
    });

    if (segmentCount === 0) throw new Error(`Segment count is zero`);

    // 3. Ask LLM to rank segments from most likely to least likely to find pertinent information
    const llmResponse = await this.llmController.executePrompt(
      GEN_RANK_SEGMENTS_PROMPT(listOfSegmentsString, query)
    );

    // 4. Parse JSON string as data type
    const segmentData = extractJSONFromString<{
      statementSegments: string[];
    }>(llmResponse);

    if (!segmentData)
      throw new Error(`Failed to extract statement/segment data`);

    if (segmentData.statementSegments.length === 0)
      throw new Error(`Failed to extract any statement segments`);

    const extractedData: ExtractedData[] = []; // Keep reference of extracted data

    // 5. Iterate through each statement segment
    // NOTE: This is a list of strings in the schema of "statement/segment"
    for (const statementSegment of segmentData.statementSegments) {
      const extension = path.extname(statementSegment);
      const fullFilePath = `${this.dataFilePath}/${statementSegment}`;
      let stringifiedData = ``;

      const statement = statementSegment.split('/')[0];
      const segment = statementSegment.split('/')[1];

      let DATA_EXTRACTION_PROMPT = ``;
      if (extension === '.json') {
        const jsonSegment = readJSON(fullFilePath);
        stringifiedData = JSON.stringify(jsonSegment);

        // 5.1 Set data extraction prompt to JSON data extraction prompt
        DATA_EXTRACTION_PROMPT = GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT(
          segment,
          stringifiedData,
          query
        );
      } else {
        const txtSegment = readTxt(fullFilePath);
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

      try {
        const resultJSON = extractJSONFromString<any>(result);
        // 9. We see if LLM added more data or decided to escape
        if (resultJSON && resultJSON.escape !== undefined) {
          // 9.2 - LLM decided to escape, break loop, causing data extracted so far to be returned.
          break;
        } else {
          // 9.1 - LLM added more data, keep going with data extracton.
          extractedData.push({
            statement,
            segment,
            data: result
          });
        }
      } catch (e) {
        extractedData.push({
          statement,
          segment,
          data: result
        });
      }
    }
    // 10. Combine extracted data into final prompt;
    return {
      finalPrompt: this.combineExtractedDataToString(extractedData),
      metadata: { extractedData }
    };
  }

  private async extractRelevantSegmentsFromStatements(
    statements: string[],
    query: string
  ): Promise<PertinentSegmentsData[]> {
    const extractedSegments: PertinentSegmentsData[] = [];
    for (const statementFile of statements) {
      try {
        // 2.1 - Get metadata for statement
        const statementMetadata = readJSON(
          `${this.dataFilePath}/${statementFile}/metadata.json`
        ) as StatementMetadata;

        if (statementMetadata.segments.length === 0) {
          // If no segments, continue loop
          console.log(`${statementFile} has no segments, continuing loop`);
          continue;
        }

        if (statementMetadata.segments.length === 1) {
          // If only one segment, just push it
          extractedSegments.push({
            statement: statementFile,
            segments: statementMetadata.segments
          });
          continue;
        }

        // 3. Ask LLM which segments it would look at
        const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
          MAX_SEGMENTS_TO_TRAVERSE,
          statementFile,
          statementMetadata.segments,
          query
        );
        const segmentPromptJsonString = await this.llmController.executePrompt(
          SEGMENT_PROMPT
        );

        // 4. Parse JSON string as data type
        const segmentPromptJson = extractJSONFromString<StatementMetadata>(
          segmentPromptJsonString
        );

        if (!segmentPromptJson) continue;

        // 4.1 Filter out files that do not exist -> GPT3 often makes up file names
        const filteredSegments = segmentPromptJson.segments.filter((seg) => {
          const exist = statementMetadata.segments.includes(seg);
          if (!exist)
            console.log(`Segment ${seg} does not exist, filtering out`);
          return exist;
        });

        if (filteredSegments.length === 0) {
          // Check if any segments exist again
          console.log(`No real segments exist`);
          continue;
        }

        // Push extracted data
        extractedSegments.push({
          statement: statementFile,
          segments: filteredSegments
        });
      } catch (e) {
        console.log(`Caught error at segment level: ${e}\n...Continuing loop`);
        continue;
      }
    }
    return extractedSegments;
  }
}
