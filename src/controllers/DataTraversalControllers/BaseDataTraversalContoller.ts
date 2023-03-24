import LLMController from '../../schema/controllers/LLMController';
import { ExtractedData } from '../../schema/ExtractedData';
import ExtractedStatementsReponse from '../../schema/ExtractedStatementsResponse';
import { DocumentMetadata, StatementMetadata } from '../../schema/Metadata';
import {
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT,
  GEN_STATEMENT_EXTRACTION_PROMPT
} from './Prompts';
import { extractJSONFromString, readJSON, readTxt } from './Utils';
import path from 'path';
import * as fs from 'fs';

export default class BaseDataTraversalContoller {
  private _llmController: LLMController;
  get llmController(): LLMController {
    return this._llmController;
  }

  private _dataFilePath: string;
  get dataFilePath(): string {
    return this._dataFilePath;
  }

  listOfStatements: string[] = [];

  constructor(llmController: LLMController, dataFilePath: string) {
    this._llmController = llmController;
    this._dataFilePath = dataFilePath;
    const json = readJSON(`${dataFilePath}/metadata.json`) as DocumentMetadata;
    this.listOfStatements = json.statements;
  }

  async extractRelevantStatementsFromQuery(
    maxStatements: number,
    query: string
  ): Promise<ExtractedStatementsReponse> {
    const prompt = GEN_STATEMENT_EXTRACTION_PROMPT(
      maxStatements,
      this.listOfStatements,
      query
    );
    const jsonString = await this.llmController.executePrompt(prompt);
    const response = extractJSONFromString<DocumentMetadata>(jsonString);

    if (!response)
      throw new Error('No JSON data can be extracted from the statements data');

    try {
      if (response.statements == undefined) {
        throw new Error('Failed to properly parse LLM document type response');
      } else {
        return response as ExtractedStatementsReponse;
      }
    } catch (e) {
      console.log(`Failed to parse JSON string due to erro: ${e}`);
      throw e;
    }
  }

  async extractRelevantSectionsFromStatement(
    maxSections: number,
    statement: string,
    query: string
  ): Promise<StatementMetadata> {
    console.log(`Extracting relevant sections from statement ${statement}`);
    // 1. For each document get metadata and ask LLM which segments it would look at

    // 1.1 - Get metadata for statement
    const statementMetadata = readJSON(
      `${this.dataFilePath}/${statement}/metadata.json`
    ) as StatementMetadata;

    // 2. Ask LLM which segments it would look at
    const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
      maxSections,
      statement,
      statementMetadata.segments,
      query
    );

    const segmentPromptJsonString = await this.llmController.executePrompt(
      SEGMENT_PROMPT
    );
    // 3. Parse JSON string as data type
    const segmentPromptJson = await extractJSONFromString<StatementMetadata>(
      segmentPromptJsonString
    );

    // 4. Check if data exists
    if (segmentPromptJson) return segmentPromptJson;
    throw new Error(`Can't extract segments from string`);
  }

  async extractDataFromSegment(
    segment: string,
    statementFile: string,
    query: string
  ): Promise<ExtractedData> {
    const segmentFilePath = `${this.dataFilePath}/${statementFile}/${segment}`;
    const extension = path.extname(segment);
    let DATA_EXTRACTION_PROMPT = '';

    // 6. Check if segment is a txt or a json file
    if (extension === '.json') {
      const data = readJSON(segmentFilePath);
      const stringifiedData = JSON.stringify(data);

      // 6.1 - If JSON file is small enough, just add it to the answer list without using LLM to extract pertinent answer
      if (stringifiedData.length < 1500) {
        return {
          statement: statementFile,
          segment,
          data: stringifiedData
        };
      }

      DATA_EXTRACTION_PROMPT = GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT(
        segment,
        stringifiedData,
        query
      );
    } else {
      /// We assume it's a .txt file if it's not a JSON file.
      const txtData = readTxt(segmentFilePath);
      DATA_EXTRACTION_PROMPT = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(
        segment,
        txtData,
        query
      );
    }

    const dataExtractionJsonString = await this.llmController.executePrompt(
      DATA_EXTRACTION_PROMPT
    );

    const extractedJSON = extractJSONFromString(dataExtractionJsonString);
    return {
      statement: statementFile,
      segment,
      data: `${JSON.stringify(extractedJSON)}}`
    };
  }

  combineExtractedDataToString(extractedData: ExtractedData[]): string {
    let combinedString = '';
    extractedData.forEach((extractedData) => {
      combinedString =
        combinedString +
        ` ----\n Info from ${extractedData.statement} in segment ${extractedData.segment}:
      ${extractedData.data}\n----
      `;
    });
    return combinedString;
  }

  doesFileExist(filePath: string): boolean {
    const fullPath = path.join(this.dataFilePath, filePath);
    return fs.existsSync(fullPath);
  }

  filterFiles(filePaths: string[]): string[] {
    return filePaths.filter((filePath) => {
      const exists = this.doesFileExist(filePath);
      if (!exists)
        console.log(`File ${filePath} does not exist, filtering out`);
      return exists;
    });
  }
}
