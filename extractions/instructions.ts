import { FOVExtractionInstruction } from '../src/schema/FirstOrderValue';

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
  }
];

export default instructions;
