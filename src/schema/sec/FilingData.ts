export type Filing = {
  id: string;
  listOfStatements: string[];
  statements: { [key: string]: Statement };
};

export type Statement = {
  name: string;
  listOfSections: string[];
  sections: { [key: string]: Section };
};

export type Section = {
  name: string;
  filetype: 'txt' | 'json';
  data: string;
};
