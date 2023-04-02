export type ProcessedFilingData = {
  id: string;
  listOfStatements: string[];
  statements: { [key: string]: ProcessedStatementData };
};

export type ProcessedStatementData = {
  name: string;
  listOfSections: string[];
  sections: { [key: string]: ProcessedSectionData };
};

export type ProcessedSectionData = {
  name: string;
  filetype: 'txt' | 'json';
  data: string;
};
