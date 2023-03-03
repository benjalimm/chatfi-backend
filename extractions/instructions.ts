import { FOVExtractionInstruction } from '../src/schema/FirstOrderValue.js';

const instructions: FOVExtractionInstruction[] = [
  {
    name: 'Capital expenditure',
    periodType: 'RANGE',
    statement: 'StatementOfCashFlows',
    synonyms: ['Plant, property & equipment']
  },
  {
    name: 'Total revenue',
    periodType: 'RANGE',
    statement: 'Statement of income',
    synonyms: []
  },
  {
    name: 'Current asset',
    periodType: 'INSTANT',
    statement: 'Balance Sheet',
    synonyms: []
  },
  {
    name: 'Current liabilities',
    periodType: 'INSTANT',
    statement: 'Balance Sheet',
    synonyms: []
  },
  {
    name: 'Operating expenses',
    periodType: 'RANGE',
    statement: 'Statement of income',
    synonyms: ['OPEX']
  },
  {
    name: 'Depreciation and amortization',
    periodType: 'RANGE',
    statement: 'StatementOfCashFlows',
    synonyms: ['D&A']
  },
  {
    name: 'Cost of sales',
    periodType: 'RANGE',
    statement: 'Statement of income',
    synonyms: ['Cost of goods sold', 'COGS', 'COS']
  },
  {
    name: 'Taxes',
    periodType: 'RANGE',
    statement: 'Statement of income',
    synonyms: ['Income tax expense']
  }
];

export default instructions;
