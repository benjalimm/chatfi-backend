import LLMController from '../schema/controllers/LLMController';
import { Formula } from '../schema/FormulaType';

export default class FormulaMatchService {
  private llmController: LLMController;
  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }

  async matchQueryWithFormula(query: string): Promise<Formula | null> {
    return null;
  }
}
