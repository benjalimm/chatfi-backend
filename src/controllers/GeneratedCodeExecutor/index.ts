import LLMController from '../../schema/controllers/LLMController';
import { ExtractedValue } from '../../schema/ExtractedValue';
import { Formula } from '../../schema/FormulaType';
import { extractJSONFromString } from '../DataTraversalControllers/Utils';
import { GEN_CODE_EXECUTOR_GENERATION_PROMPT } from './prompts';

export default class GeneratedCodeExecutor {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }

  async outputExecutable(
    formulaString: string,
    extractedValues: ExtractedValue[],
    dateOrRange: string
  ): Promise<string> {
    const PROMPT = GEN_CODE_EXECUTOR_GENERATION_PROMPT(
      extractedValues,
      formulaString,
      dateOrRange
    );
    const result = await this.llmController.executePrompt(PROMPT);
    const object = extractJSONFromString(result) as { output: string };
    return object.output;
  }
}
