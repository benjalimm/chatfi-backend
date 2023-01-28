import LLMController from '../../../schema/controllers/LLMController';
import { Formula } from '../../../schema/FormulaType';

export default class FormulaMatchService {
  private formulas: Formula[];
  constructor() {
    this.formulas = [
      {
        name: 'Quick ratio',
        synonyms: [],
        formula: 'Current assets / Current liabilities',
        properties: ['Current assets', 'Current liabilities']
      }
    ];
  }

  matchEntityWithFormula(entity: string): Formula | null {
    return null;
  }
}
