import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import { ExtractedData } from '../../schema/ExtractedData';
import { StatementMetadata } from '../../schema/Metadata';
import {
  GEN_RANK_SEGMENTS_PROMPT,
  GEN_SEGMENT_EXTRACTION_PROMPT
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

    // 1.1 - We store extracted pertinent info in this array
    const extractedData: ExtractedData[] = [];

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

    // 5. Iterate through each statement segment
    for (const statementSegment of segmentData.statementSegments) {
      const extension = path.extname(statementSegment);
      const fullFilePath = `${this.dataFilePath}/${statementSegment}`;
      if (extension === '.json') {
        const segment = require(fullFilePath);
      } else {
        const txtData = fs.readFileSync(fullFilePath, 'utf8');
      }
    }
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
