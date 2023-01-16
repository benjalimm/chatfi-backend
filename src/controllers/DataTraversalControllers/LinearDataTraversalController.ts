import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import { StatementMetadata } from '../../schema/Metadata';
import path from 'path';
import {
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT
} from './Prompts';
import { ExtractedData } from '../../schema/ExtractedData';
import { extractJSONFromString, readJSON, readTxt } from './Utils';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';

const MAX_STATEMENTS = 3;
const MAX_SEGMENTS = 6;

export default class LinearDataTraversalController
  extends BaseDataTraversalContoller
  implements LLMDataTraversalController
{
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    this.listOfStatements = reportMetadata.statements;
  }

  async generateFinalPrompt(query: string): Promise<DataTraversalPromptResult> {
    // 1. Get list of pertinent statements
    const extractedStatementsResponse =
      await this.extractRelevantStatementsFromQuery(MAX_STATEMENTS, query);

    console.log('DOCUMENT TYPE RESPONSE: ');
    console.log(extractedStatementsResponse);

    // 1.1 - We store extracted pertinent info in this array
    const extractedData: ExtractedData[] = [];

    for (const statementFile of extractedStatementsResponse.statements) {
      try {
        const extractedSegmentsMetadata =
          await this.extractRelevantSectionsFromStatement(
            MAX_SEGMENTS,
            statementFile,
            query
          );

        // 5. For each segment, get the data and ask LLM to extract the pertinent data
        for (const segment of extractedSegmentsMetadata.segments) {
          try {
            const extractedDataFromSegment = await this.extractDataFromSegment(
              segment,
              statementFile,
              query
            );
            extractedData.push(extractedDataFromSegment);
          } catch (e) {
            console.log(
              `Caught error at segment level: ${e}\n...Continuing loop`
            );
            continue;
          }
        }
      } catch (e) {
        console.log(
          `Caught error at statement level: ${e}\n...Continuing loop`
        );
      }
    }

    // 7. Combine string, label data and return
    const combinedString = this.combineExtractedDataToString(extractedData);

    if (combinedString.trim() === '') throw new Error(`Final prompt is empty`);

    return { finalPrompt: combinedString, metadata: null };
  }
}
