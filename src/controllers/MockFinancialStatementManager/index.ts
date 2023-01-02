import { GET_DOCUMENT_TYPE_PROMPT } from "../../prompts";
import FinancialStatementManager from "../../schema/controllers/FinancialStatementManager";
import LLMController from "../../schema/controllers/LLMController";
import { DocumentType } from "../../schema/DocumentType";
import LLMDocumentTypeResponse from "../../schema/LLMDocumentTypeResponse";

const balanceSheet = require("../../../sampleData/balanceSheet.json");
const incomeStatement = require("../../../sampleData/incomeStatement.json");
const cashFlowStatement = require("../../../sampleData/cashFlowStatement.json");
const shareholdersEquityStatement = require("../../../sampleData/shareholdersEquity.json");
const statementOfOperations = require("../../../sampleData/statementOfOperations.json");

export default class MockFinancialStatementManager implements FinancialStatementManager {

  private statements: Map<DocumentType, string>
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.statements = new Map();
    this.loadFinancialStatements();
  }

  async getFinancialStatement(documentType: DocumentType | string): Promise<string> {
    return this.statements.get(documentType as DocumentType) ?? ""
  }

  private loadFinancialStatements() {
    this.statements.set("INCOME_STATEMENT", JSON.stringify(incomeStatement));
    this.statements.set("BALANCE_SHEET", JSON.stringify(balanceSheet));
    this.statements.set("CASH_FLOW_STATEMENT", JSON.stringify(cashFlowStatement));
    this.statements.set("SHAREHOLDERS_EQUITY_STATEMENT", JSON.stringify(shareholdersEquityStatement));
    this.statements.set("STATEMENT_OPERATIONS", JSON.stringify(statementOfOperations));
  }

  private async getDocumentTypeFromQuery(query: string): Promise<LLMDocumentTypeResponse> {
    const prompt = GET_DOCUMENT_TYPE_PROMPT + query;
    const jsonString = await this.llmController.executePrompt(prompt);
    return JSON.parse(jsonString.trim()) as LLMDocumentTypeResponse;
  }

  async getDocumentStringsFromQuery(query: string): Promise<string> {
    const documentTypeResponse = await this.getDocumentTypeFromQuery(query);
    console.log(documentTypeResponse);
    let documentString: string = "";

    await documentTypeResponse.documentTypes.forEach(async type => {
      const statementString = await this.getFinancialStatement(type);
      documentString = `${documentString} \n${type}: \n${JSON.stringify(statementString)}\n`;
    })

    return documentString;
  }
}