import { GET_DOCUMENT_TYPE_PROMPT } from "../../prompts";
import FinancialStatementManager from "../../schema/controllers/FinancialStatementManager";
import LLMController from "../../schema/controllers/LLMController";
import { PrimaryDocumentType, SecondaryDocumentType } from "../../schema/DocumentType";
import LLMDocumentTypeResponse from "../../schema/LLMDocumentTypeResponse";
import reportMetadata from "../../../sampleData/COINBASE_10_Q/metadata.json";
import { SegmentMetadata } from "../../schema/Metadata";
import path from 'path';


const DATA_FILE_PATH = "../../../sampleData/COINBASE_10_Q";

export default class MockFinancialStatementManager implements FinancialStatementManager {

  private statements: Map<PrimaryDocumentType | SecondaryDocumentType, string>
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.statements = new Map();
    this.loadFinancialStatements();
  }

  async getFinancialStatement(documentType: string): Promise<string> {
    return this.statements.get(documentType as PrimaryDocumentType) ?? ""
  }

  getListOfFinancialStatements(): string[] {
    return reportMetadata.statements;
  }

  private loadStatement(type: PrimaryDocumentType | SecondaryDocumentType, document: any) {
    this.statements.set(type, JSON.stringify(document));
  }

  private extractJSONStringFromString(str: string): string {
    return str.trim();
  }

  private loadFinancialStatements() {
  }

  private async getDocumentTypeFromQuery(query: string): Promise<LLMDocumentTypeResponse> {
    const listOfStatements = this.getListOfFinancialStatements();
    const prompt = `${listOfStatements}\n` + GET_DOCUMENT_TYPE_PROMPT + query;
    const jsonString = await this.llmController.executePrompt(prompt);
    const extractedJSONString = this.extractJSONStringFromString(jsonString)
    console.log(`ExtractedJSONString: ${extractedJSONString}`)

    try {
      const response = JSON.parse(extractedJSONString)
      if (response.documentTypes == undefined) {
        throw new Error('Failed to properly parse LLM document type response')
      } else {
        return response as LLMDocumentTypeResponse;
      }
    } catch (e) {
      console.log(`Failed to parse JSON string due to erro: ${e}`)
      throw e
    }
    
  }

  async getDocumentStringsFromQuery(query: string): Promise<string> {

    // 1. Get list of pertinent statements
    const documentTypeResponse = await this.getDocumentTypeFromQuery(query);

    console.log('DOCUMENT TYPE RESPONSE: ')
    console.log(documentTypeResponse);

    // 1.1 - We store extracted pertinent info in this array
    let extractedData: {
        statement: string,
        segment: string, 
        data: string
      }[] = [];

    await documentTypeResponse.documentTypes.forEach(async statementFile => {
      // 2. For each document get metadata and ask LLM which segments it would look at 

      // 2.1 - Get metadata for statement
      const statementMetadata = require(`${DATA_FILE_PATH}/${statementFile}/metadata.json`) as SegmentMetadata;

      // 2.2 - Get segments for statement
      const segments = statementMetadata.segments;

      // 3. Ask LLM which segments it would look at
      const SEGMENT_PROMPT = `${segments}\nListed above are segments within the ${statementFile}. Based on the following query, which segments would you look at? Output the answer in a JSON with the following schema:
      {
        "segments": string[]
      }

      \n Query: ${query}`;

      const segmentPromptJsonString = await this.llmController.executePrompt(SEGMENT_PROMPT)

      // 4. Parse JSON string as data type
      const segmentPromptJson = JSON.parse(segmentPromptJsonString) as SegmentMetadata;

      // 5. For each segment, get the data and ask LLM to extract the pertinent data
      await segmentPromptJson.segments.forEach(async segment => {
        const data = require(`${DATA_FILE_PATH}/${statementFile}/${segment}`)
        const extension = path.extname(segment);
        let DATA_EXTRACTION_PROMPT = '';
        
        // 6. Check if segment is a txt or a json file
        if (extension === '.json') {
          // 6.1 - If JSON, use JSON prompt. If txt, use TXT prompt
          const JSON_SEGMENT_PROMPT = `
          ${data}
          \n Listed above is a JSON for the segment ${segment}. Based on the following query, extract the pertinent data in a structured JSON?
          \n Query: ${query}
          `
          DATA_EXTRACTION_PROMPT = JSON_SEGMENT_PROMPT;
        } else {
          /// We assume it's a .txt file if it's not a JSON file.
          const TXT_SEGMENT_PROMPT = `
          ${data}
          \n Listed above is a txt for the segment ${segment}. It might contain tables that were copy and pasted straight from a pdf file. Based on the following query, extract the pertinent data in a structured JSON
          \n Query: ${query}
          `
          DATA_EXTRACTION_PROMPT = TXT_SEGMENT_PROMPT;
        }

        const dataExtractionJsonString = await this.llmController.executePrompt(DATA_EXTRACTION_PROMPT);

        extractedData.push({ 
          statement: statementFile, 
          segment, 
          data: dataExtractionJsonString
        })
      })
    })

    // 7. Combine string, label data and return


    return "";
  }
}