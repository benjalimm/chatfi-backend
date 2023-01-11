import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import { StatementMetadata } from '../../schema/Metadata';
import path from 'path';
import * as fs from 'fs';
import {
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT
} from './Prompts';
import { ExtractedData } from '../../schema/ExtractedData';
import { extractJSONFromString, readJSON } from './Utils';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';

const MAX_STATEMENTS = 3;
const MAX_SEGMENTS = 3;

export default class LinearDataTraversalController extends BaseDataTraversalContoller {
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    this.listOfStatements = reportMetadata.statements;
  }

  async generateFinalPrompt(query: string): Promise<string> {
    // 1. Get list of pertinent statements
    const extractedStatementsResponse =
      await this.extractRelevantStatementsFromQuery(MAX_STATEMENTS, query);

    console.log('DOCUMENT TYPE RESPONSE: ');
    console.log(extractedStatementsResponse);

    // 1.1 - We store extracted pertinent info in this array
    const extractedData: ExtractedData[] = [];

    for (const statementFile of extractedStatementsResponse.statements) {
      try {
        // 2. For each document get metadata and ask LLM which segments it would look at

        // 2.1 - Get metadata for statement
        const statementMetadata = readJSON(
          `${this.dataFilePath}/${statementFile}/metadata.json`
        ) as StatementMetadata;

        // 3. Ask LLM which segments it would look at
        const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
          MAX_SEGMENTS,
          statementMetadata.segments,
          query
        );

        const segmentPromptJsonString = await this.llmController.executePrompt(
          SEGMENT_PROMPT
        );
        // 4. Parse JSON string as data type
        const segmentPromptJson =
          await extractJSONFromString<StatementMetadata>(
            segmentPromptJsonString
          );

        if (segmentPromptJson === null) {
          continue;
        }

        // 5. For each segment, get the data and ask LLM to extract the pertinent data
        for (const segment of segmentPromptJson.segments) {
          try {
            const segmentFilePath = `${this.dataFilePath}/${statementFile}/${segment}`;
            const data = readJSON(segmentFilePath);
            const extension = path.extname(segment);
            let DATA_EXTRACTION_PROMPT = '';

            // 6. Check if segment is a txt or a json file
            if (extension === '.json') {
              const stringifiedData = JSON.stringify(data);

              // 6.1 - If JSON file is small enough, just add it to the answer list without using LLM to extract pertinent answer
              if (stringifiedData.length < 1500) {
                extractedData.push({
                  statement: statementFile,
                  segment,
                  data: stringifiedData
                });
                continue;
              }

              DATA_EXTRACTION_PROMPT = GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT(
                segment,
                stringifiedData,
                query
              );
            } else {
              /// We assume it's a .txt file if it's not a JSON file.
              const txtData = fs.readFileSync(segmentFilePath, 'utf8');
              DATA_EXTRACTION_PROMPT = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(
                segment,
                txtData,
                query
              );
            }

            const dataExtractionJsonString =
              await this.llmController.executePrompt(DATA_EXTRACTION_PROMPT);

            extractedData.push({
              statement: statementFile,
              segment,
              data: dataExtractionJsonString
            });
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
    return combinedString;
  }
}
