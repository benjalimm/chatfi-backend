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
      },
      {
        name: 'Unlevered free cash flow',
        synonyms: ['UFCF'],
        formula:
          'EBITDA - Capital Expenditure - Change in working capital - Taxes',
        properties: [
          'EBITDA',
          'Capital expenditure',
          'Working capital',
          'Taxes'
        ]
      },
      {
        name: 'EBITDA',
        synonyms: [
          'Earnings before interest taxes depreciation and amortization'
        ],
        formula:
          'Total revenue - total cost of sales - total operating expenses + depreciation and amortization',
        properties: [
          'Total revenue',
          'Total cost of sales',
          'Total operating expenses',
          'Depreciation and amortization'
        ]
      },
      {
        name: 'Change in working capital',
        synonyms: [],
        formula:
          '(Current asset 2 - current liabilities 2) - (Current asset 1 - Current liabilities 1)',
        properties: [
          'Current asset 1',
          'Current liabilities 1',
          'Current asset 2',
          'Current liabilities 2'
        ]
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
