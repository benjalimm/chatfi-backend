import LLMController from '../../../schema/controllers/LLMController';
import { FirstOrderValue } from '../../../schema/extraction/FirstOrderValue';
import { Formula } from '../../../schema/extraction/FormulaType';
import { extractJSONFromString } from '../../DataTraversalControllers/Utils';
import { GEN_CODE_EXECUTOR_GENERATION_PROMPT } from './prompts';

export default class GeneratedCodeExecutor {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }

  async outputExecutable(
    formulas: Formula[],
    extractedValues: FirstOrderValue[],
    query: string
  ): Promise<string> {
    console.log(`Attempting to generate executable code`);
    const PROMPT = GEN_CODE_EXECUTOR_GENERATION_PROMPT(
      extractedValues,
      formulas,
      query
    );
    const result = await this.llmController.executePrompt(PROMPT);
    const object = extractJSONFromString(result) as { output: string };
    return object.output;
  }
}
