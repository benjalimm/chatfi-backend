import LLMExtractionController from '../../schema/controllers/ExtractionController';
import LLMController from '../../schema/controllers/LLMController';
import LLMDocumentTypeResponse from '../../schema/LLMDocumentTypeResponse';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import { SegmentMetadata } from '../../schema/Metadata';
import path from 'path';
import * as fs from 'fs';
import {
  GEN_STATEMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_EXTRACTION_PROMPT
} from './SharedPrompts';

const DATA_FILE_PATH = '../../sampleData/COINBASE_10_Q';

const MAX_STATEMENTS = 3;
const MAX_SEGMENTS = 3;

export default class LinearExtractionController
  implements LLMExtractionController
{
  private llmController: LLMController;
  private dataFilePath: string;
  constructor(llmController: LLMController, dataFilePath: string) {
    this.llmController = llmController;
    this.dataFilePath = dataFilePath;
  }

  getListOfFinancialStatements(): string[] {
    return reportMetadata.statements;
  }

  private extractJSONStringFromString(str: string): string {
    const strings = str.split('{');

    if (strings.length === 0) {
      return str;
    }

    // Add back opening bracket
    const jsonString = '{ ' + strings[strings.length - 1];
    return jsonString;
  }

  private async getDocumentTypeFromQuery(
    query: string
  ): Promise<LLMDocumentTypeResponse> {
    const listOfStatements = this.getListOfFinancialStatements();

    const prompt = GEN_STATEMENT_EXTRACTION_PROMPT(
      MAX_STATEMENTS,
      listOfStatements,
      query
    );
    const jsonString = await this.llmController.executePrompt(prompt);
    const extractedJSONString = this.extractJSONStringFromString(jsonString);
    console.log(`ExtractedJSONString: ${extractedJSONString}`);

    try {
      const response = JSON.parse(extractedJSONString);
      if (response.documentTypes == undefined) {
        throw new Error('Failed to properly parse LLM document type response');
      } else {
        return response as LLMDocumentTypeResponse;
      }
    } catch (e) {
      console.log(`Failed to parse JSON string due to erro: ${e}`);
      throw e;
    }
  }

  async generateFinalPrompt(query: string): Promise<string> {
    // 1. Get list of pertinent statements
    const documentTypeResponse = await this.getDocumentTypeFromQuery(query);

    console.log('DOCUMENT TYPE RESPONSE: ');
    console.log(documentTypeResponse);

    // 1.1 - We store extracted pertinent info in this array
    const extractedData: {
      statement: string;
      segment: string;
      data: string;
    }[] = [];

    for (const statementFile of documentTypeResponse.documentTypes) {
      try {
        // 2. For each document get metadata and ask LLM which segments it would look at

        // 2.1 - Get metadata for statement
        const statementMetadata =
          require(`${this.dataFilePath}/${statementFile}/metadata.json`) as SegmentMetadata;

        // 2.2 - Get segments for statement
        const segments = statementMetadata.segments;

        // 3. Ask LLM which segments it would look at
        const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
          MAX_SEGMENTS,
          segments,
          query
        );

        const segmentPromptJsonString = await this.llmController.executePrompt(
          SEGMENT_PROMPT
        );

        const extractedSegmentPromptJsonString =
          await this.extractJSONStringFromString(segmentPromptJsonString);

        // 4. Parse JSON string as data type
        const segmentPromptJson = JSON.parse(
          extractedSegmentPromptJsonString
        ) as SegmentMetadata;

        // 5. For each segment, get the data and ask LLM to extract the pertinent data
        for (const segment of segmentPromptJson.segments) {
          try {
            const segmentFilePath = `${DATA_FILE_PATH}/${statementFile}/${segment}`;
            const data = require(segmentFilePath);
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

              const JSON_SEGMENT_PROMPT = `
            ${stringifiedData}
            \n Listed above is a JSON for the segment ${segment}. Based on the following query, extract the pertinent data from the data listed above and output the data in a structured JSON.
            \n Query: ${query}
            `;
              DATA_EXTRACTION_PROMPT = JSON_SEGMENT_PROMPT;
            } else {
              const txtData = fs.readFileSync(segmentFilePath, 'utf8');
              /// We assume it's a .txt file if it's not a JSON file.
              const TXT_SEGMENT_PROMPT = `
            ${txtData}
            \n Listed above is a txt for the segment ${segment}. It might contain tables that were copy and pasted straight from a pdf file. Based on the following query, extract the pertinent data in a structured JSON
            \n Query: ${query}
            `;
              DATA_EXTRACTION_PROMPT = TXT_SEGMENT_PROMPT;
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
    let combinedString = '';
    extractedData.forEach((extractedData) => {
      combinedString =
        combinedString +
        `
      \n----\n Info from ${extractedData.statement} in segment ${extractedData.segment}:
      ${extractedData.data}\n----
      `;
    });

    return combinedString;
  }
}
