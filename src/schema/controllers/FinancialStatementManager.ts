import { DocumentType } from "../DocumentType";

export default interface FinancialStatementManager {

  // If arbitrary string is passed in, it means query custom financial statement
  getFinancialStatement(documentType: DocumentType | string): Promise<string>;
}