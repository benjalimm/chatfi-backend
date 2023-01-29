import LLMController from '../../../schema/controllers/LLMController';
import { Formula } from '../../../schema/FormulaType';
import * as ss from 'string-similarity';

export default class FormulaMatchService {
  private formulas: Formula[];
  private matchThreshold = 0.95;
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
    const matches: { formula: Formula; similarity: number }[] = [];
    this.formulas.forEach((formula) => {
      const simililarity = ss.compareTwoStrings(formula.name, entity);
      if (simililarity >= this.matchThreshold) {
        matches.push({ formula, similarity: simililarity });
      }
    });

    if (matches.length === 0) return null;

    // Get highest value
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches[0].formula;
  }
}
