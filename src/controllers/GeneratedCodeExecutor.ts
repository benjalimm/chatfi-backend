import LLMController from '../schema/controllers/LLMController';
import { ExtractedValue } from '../schema/ExtractedValue';
import { Formula } from '../schema/FormulaType';

export default class GeneratedCodeExecutor {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }

  async outputExecutable(
    formula: Formula,
    extractedValues: ExtractedValue[]
  ): string {}
}
