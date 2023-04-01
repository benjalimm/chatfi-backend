import LLMController from '../../schema/controllers/LLMController';
import { ExtractedData } from '../../schema/dataTraversal/ExtractedData';
import ExtractedStatementsReponse from '../../schema/extraction/ExtractedStatementsResponse';
import {
  DocumentMetadata,
  StatementMetadata
} from '../../schema/dataTraversal/Metadata';
import {
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT,
  GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT,
  GEN_STATEMENT_EXTRACTION_PROMPT
} from './Prompts';
import { extractJSONFromString } from './Utils';
import { FilingData } from '../../schema/sec/FilingData';

const MAX_SECTION_LENGTH = 3000;
export default class BaseDataTraversalContoller {
  private _llmController: LLMController;
  private report: FilingData;
  get llmController(): LLMController {
    return this._llmController;
  }

  constructor(llmController: LLMController, report: FilingData) {
    this._llmController = llmController;
    this.report = report;
  }

  async extractRelevantStatementsFromQuery(
    maxStatements: number,
    query: string
  ): Promise<ExtractedStatementsReponse> {
    const prompt = GEN_STATEMENT_EXTRACTION_PROMPT(
      maxStatements,
      this.report.listOfStatements,
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

    // 2. Ask LLM which segments it would look at
    const SEGMENT_PROMPT = GEN_SEGMENT_EXTRACTION_PROMPT(
      maxSections,
      statement,
      this.report.statements[statement].listOfSections,
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
    let DATA_EXTRACTION_PROMPT = '';
    const section = this.report.statements[statementFile].sections[segment];

    // 6. Check if segment is a txt or a json file
    if (section.filetype === 'json') {
      // 6.1 - If JSON file is small enough, just add it to the answer list without using LLM to extract pertinent answer
      if (section.data.length < MAX_SECTION_LENGTH) {
        return {
          statement: statementFile,
          segment,
          data: section.data
        };
      }

      DATA_EXTRACTION_PROMPT = GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT(
        segment,
        section.data,
        query
      );
    } else {
      /// We assume it's a .txt file if it's not a JSON file.
      DATA_EXTRACTION_PROMPT = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(
        segment,
        section.data,
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
}
