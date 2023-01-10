import FinancialStatementManager from '../../schema/controllers/FinancialStatementManager';
import LLMController from '../../schema/controllers/LLMController';
import {
  PrimaryDocumentType,
  SecondaryDocumentType
} from '../../schema/DocumentType';
import LLMDocumentTypeResponse from '../../schema/LLMDocumentTypeResponse';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import { SegmentMetadata } from '../../schema/Metadata';
import path from 'path';
import * as fs from 'fs';

const DATA_FILE_PATH = '../../sampleData/COINBASE_10_Q';

const MAX_STATEMENTS = 3;
const MAX_SEGMENTS = 3;

export default class MockFinancialStatementManager
  implements FinancialStatementManager
{
  private statements: Map<PrimaryDocumentType | SecondaryDocumentType, string>;
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.statements = new Map();
    this.loadFinancialStatements();
  }

  async getFinancialStatement(documentType: string): Promise<string> {
    return this.statements.get(documentType as PrimaryDocumentType) ?? '';
  }

  getListOfFinancialStatements(): string[] {
    return reportMetadata.statements;
  }

  private loadStatement(
    type: PrimaryDocumentType | SecondaryDocumentType,
    document: any
  ) {
    this.statements.set(type, JSON.stringify(document));
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

  private loadFinancialStatements() {}

  private async getDocumentTypeFromQuery(
    query: string
  ): Promise<LLMDocumentTypeResponse> {
    const listOfStatements = this.getListOfFinancialStatements();

    const DOC_TYPE_PROMPT = `
    Above are the financial statements that are available for company X. Based on the following query, which financial statement should be queried? You can only select a maximum of ${MAX_STATEMENTS} statements.
    Format the answers with the following JSON format:
    { "documentTypes": string[] }
    The output array should be ordered from most important statement to least important statement.

    Query: 
    `;
    const prompt = `${listOfStatements}\n` + DOC_TYPE_PROMPT + query;
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

  async getDocumentStringsFromQuery(query: string): Promise<string> {
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
          require(`${DATA_FILE_PATH}/${statementFile}/metadata.json`) as SegmentMetadata;

        // 2.2 - Get segments for statement
        const segments = statementMetadata.segments;

        // 3. Ask LLM which segments it would look at
        const SEGMENT_PROMPT = `List of segments:\n${segments}\. Based on the following query, which file segments listed above would you look at? Only list files that are listed above and do not invent new ones. You are only allowed to pick a maximum of ${MAX_SEGMENTS} files. Output the exact answer including the file extension with no changes in a JSON with the following schema:
      {
        "segments": string[]
      }

      \n Query: ${query}`;

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
