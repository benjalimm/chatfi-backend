export interface Filing {
  id: string;
  accessionNo: string;
  cik: string;
  ticker: string;
  companyName: string;
  companyNameLong: string;
  formType: string;
  description: string;
  filedAt: string;
  linkToTxt: string;
  linkToHtml: string;
  linkToXbrl: string;
  linkToFilingDetails: string;
  entities: Entity[];
  documentFormatFiles: DocumentFormatFile[];
}

export interface Entity {
  companyName: string;
  cik: string;
  irsNo: string;
  stateOfIncorporation: string;
  fiscalYearEnd: string;
  type: string;
  act: string;
  fileNo: string;
  filmNo: string;
  sic: string;
}

export interface DocumentFormatFile {
  sequence: string;
  description: string;
  documentUrl: string;
  type: string;
  size: string;
}

export interface FilingResponse {
  total: {
    value: number;
    relation: string;
  };
  query: {
    from: number;
    size: number;
  };
  filings: Filing[];
}
