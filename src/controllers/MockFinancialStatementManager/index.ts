import { GET_DOCUMENT_TYPE_PROMPT } from "../../prompts";
import FinancialStatementManager from "../../schema/controllers/FinancialStatementManager";
import LLMController from "../../schema/controllers/LLMController";
import { PrimaryDocumentType, SecondaryDocumentType } from "../../schema/DocumentType";
import LLMDocumentTypeResponse from "../../schema/LLMDocumentTypeResponse";

const balanceSheet = require("../../../sampleData/coinbase10Q/balanceSheet.json");
const incomeStatement = require("../../../sampleData/coinbase10Q/incomeStatement.json");
const cashFlowStatement = require("../../../sampleData/coinbase10Q/cashFlowStatement.json");
const shareholdersEquityStatement = require("../../../sampleData/coinbase10Q/shareholdersEquity.json");
const statementOfOperations = require("../../../sampleData/coinbase10Q/statementOfOperations.json");
const revenueNotes = require("../../../sampleData/coinbase10Q/revenueNotes.json");
const acquisitionNotes = require("../../../sampleData/coinbase10Q/acquisitionNotes.json");

export default class MockFinancialStatementManager implements FinancialStatementManager {

  private statements: Map<PrimaryDocumentType | SecondaryDocumentType, string>
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.statements = new Map();
    this.loadFinancialStatements();
  }

  async getFinancialStatement(documentType: PrimaryDocumentType | SecondaryDocumentType): Promise<string> {
    return this.statements.get(documentType as PrimaryDocumentType) ?? ""
  }

  private loadStatement(type: PrimaryDocumentType | SecondaryDocumentType, document: any) {
    this.statements.set(type, JSON.stringify(document));
  }

  private loadFinancialStatements() {
    this.loadStatement("INCOME_STATEMENT", incomeStatement);
    this.loadStatement("BALANCE_SHEET", balanceSheet);
    this.loadStatement("CASH_FLOW_STATEMENT", cashFlowStatement);
    this.loadStatement("SHAREHOLDERS_EQUITY_STATEMENT", shareholdersEquityStatement);
    this.loadStatement("STATEMENT_OPERATIONS", statementOfOperations);

    // Load Secondary document type
    this.loadStatement("REVENUE_NOTES", revenueNotes);
    this.loadStatement("ACQUISITION_NOTES", acquisitionNotes);

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

    console.log("DOCUMENT STRING: ")
    console.log(documentString)
    return documentString;
  }
}