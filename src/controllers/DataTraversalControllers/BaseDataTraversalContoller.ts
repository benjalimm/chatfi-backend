import LLMController from '../../schema/controllers/LLMController';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';
import LLMDocumentTypeResponse from '../../schema/LLMDocumentTypeResponse';
import { GEN_STATEMENT_EXTRACTION_PROMPT } from './SharedPrompts';
import { extractSingularJSONFromString } from './Utils';

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
  ): Promise<LLMDocumentTypeResponse> {
    const prompt = GEN_STATEMENT_EXTRACTION_PROMPT(
      maxStatements,
      this.listOfStatements,
      query
    );
    const jsonString = await this.llmController.executePrompt(prompt);
    const extractedJSONString = extractSingularJSONFromString(jsonString);
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
    throw new Error('Method not implemented in base class');
  }
}
