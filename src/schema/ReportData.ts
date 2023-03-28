export type Report = {
  id: string;
  listOfDocs: string[];
  documents: { [key: string]: Document };
};

export type Document = {
  name: string;
  listOfSections: string[];
  sections: { [key: string]: Section };
};

export type Section = {
  name: string;
  filetype: 'txt' | 'json';
  data: string;
};
