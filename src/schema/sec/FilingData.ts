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

export type ProcessedTextSectionData = {
  fileType: 'html';
  htmlData: string;
};

export type ProcessedLineItemSectionData = {
  fileType: 'json';
  jsonData: string;
};

export type ProcessedSectionData =
  | ProcessedTextSectionData
  | ProcessedLineItemSectionData;
