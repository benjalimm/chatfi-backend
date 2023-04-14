export type ProcessedStatementsKeyValueStore = {
  [key: string]: ProcessedStatementData;
};

export type ProcessedFilingData = {
  id: string;
  listOfStatements: string[];
  statements: ProcessedStatementsKeyValueStore;
};

export type ProcessedSectionsKeyValueStore = {
  [key: string]: ProcessedSectionData;
};

export type ProcessedStatementData = {
  name: string;
  listOfSections: string[];
  sections: ProcessedSectionsKeyValueStore;
};

export type ProcessedSectionData = {
  name: string;
  filetype: 'txt' | 'json';
  data: string;
};
