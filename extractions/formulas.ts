import { Formula } from '../src/schema/FormulaType.js';

const formulas: Formula[] = [
  {
    name: 'Quick ratio',
    synonyms: [],
    formula: 'Current assets / Current liabilities',
    properties: ['Current assets', 'Current liabilities']
  },
  {
    name: 'Unlevered free cash flow',
    synonyms: ['UFCF'],
    formula: 'EBITDA - Capital Expenditure - Change in working capital - Taxes',
    properties: [
      'EBITDA',
      'Capital expenditure',
      'Change in working capital',
      'Taxes'
    ]
  },
  {
    name: 'EBITDA',
    synonyms: ['Earnings before interest taxes depreciation and amortization'],
    formula:
      'Total revenue - total cost of sales - total operating expenses + depreciation and amortization',
    properties: [
      'Total revenue',
      'Cost of sales',
      'Operating expenses',
      'Depreciation and amortization'
    ]
  },
  {
    name: 'Change in working capital',
    synonyms: ['Working capital'],
    formula:
      '(Current asset of end date - current liabilities of end date) - (Current asset of start date - Current liabilities of start date)',
    properties: ['Current asset', 'Current liabilities']
  }
];

export default formulas;
