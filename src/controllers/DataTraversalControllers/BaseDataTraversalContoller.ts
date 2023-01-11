import LLMController from '../../schema/controllers/LLMController';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';
import { ExtractedData } from '../../schema/ExtractedData';
import ExtractedStatementsReponse from '../../schema/ExtractedStatementsResponse';
import { DocumentMetadata, StatementMetadata } from '../../schema/Metadata';
import { GEN_STATEMENT_EXTRACTION_PROMPT } from './Prompts';
import { extractJSONFromString } from './Utils';

export default class BaseDataTraversalContoller
  implements LLMDataTraversalController
{
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

  combineExtractedDataToString(extractedData: ExtractedData[]): string {
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

  async generateFinalPrompt(query: string): Promise<string> {
    throw new Error('Method not implemented in base class');
  }
}
