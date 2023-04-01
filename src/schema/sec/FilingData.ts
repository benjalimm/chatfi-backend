export type FilingData = {
  id: string;
  listOfStatements: string[];
  statements: { [key: string]: StatementData };
};

export type StatementData = {
  name: string;
  listOfSections: string[];
  sections: { [key: string]: SectionData };
};

export type SectionData = {
  name: string;
  filetype: 'txt' | 'json';
  data: string;
};
