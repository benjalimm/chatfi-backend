export type Formula = {
  name: string;
  synonyms: string[];
  formula: string;
  properties: string[];
};

const example: Formula = {
  name: 'Quick ratio',
  synonyms: [],
  formula: 'Current assets / Current liabilities',
  properties: ['Current assets', 'Current liabilities']
};
