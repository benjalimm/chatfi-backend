import LLMController from '../../schema/controllers/LLMController';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';
import { DataTraversalResult } from '../../schema/DataTraversalResult';
import { ExtractedData } from '../../schema/ExtractedData';
import { StatementMetadata } from '../../schema/Metadata';
import { QueryUpdate } from '../../schema/QueryUpdate';
import { Report } from '../../schema/ReportData';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import {
  GEN_SEGMENT_EXTRACTION_PROMPT,
  GEN_STANDARD_STATEMENT_EXTRACTION_PROMPT
} from './Prompts';
import { extractJSONFromString, readJSON } from './Utils';

type StandardStatementResponse = {
  statements: string[];
  requiresNotes: boolean;
};
export default class SimpleDataTraversalController
  extends BaseDataTraversalContoller
  implements LLMDataTraversalController
{
  private standardStatements = [
    'BalanceSheets',
    'StatementsOfCashFlows',
    'StatementsOfComprehensiveIncome',
    'StatementsOfIncome',
    'StatementsOfShareholdersEquity'
  ];
  constructor(llmController: LLMController, report: Report) {
    super(llmController, report);
  }

  async determineInitialStandardStatements(
    query: string,
    standardStatements: string[]
  ): Promise<StandardStatementResponse> {
    const data = await this.llmController.executePrompt(
      GEN_STANDARD_STATEMENT_EXTRACTION_PROMPT(query, standardStatements)
    );

    const response = extractJSONFromString<StandardStatementResponse>(data);

    if (response) return response;
    throw new Error(`Can't parse JSON from LLM response: ${data}`);
  }

  async extractRelevantData(
    query: string,
    onExtractionUpdate?: (update: QueryUpdate) => void
  ): Promise<DataTraversalResult> {
    // Step 1. Ask LLM which statements it would look at
    const response = await this.determineInitialStandardStatements(
      query,
      this.standardStatements
    );

    // 1.1 If only requires notes, simply escape and return requires notes;
    if (response.statements.length === 0 || response.requiresNotes) {
      return { listOfExtractedData: [], metadata: { requiresNotes: true } };
    }

    const extractedData: ExtractedData[] = [];
    // Step 2. Gather list of segments for each relevant statement and ask LLM which one it would look at.
    console.log(`Statements: ${JSON.stringify(response.statements)}`);
    for (const statement of response.statements) {
      onExtractionUpdate?.({ type: 'STATEMENT', name: statement });
      // 3. Extract relevant sections from statement
      console.log(`Statement: ${statement}`);
      const extractedSectionsMetadata =
        await this.extractRelevantSectionsFromStatement(3, statement, query);

      // 4. For each statement, extract relevant segments
      for (const section of extractedSectionsMetadata.segments) {
        onExtractionUpdate?.({ type: 'SECTION', name: section });
        try {
          const extractedDataFromSection = await this.extractDataFromSegment(
            section,
            statement,
            query
          );
          extractedData.push(extractedDataFromSection);
        } catch (e) {
          console.log(
            `Failed to extract data from section ${section} due to error: ${e}. Continuing loop...`
          );
          continue;
        }
      }
    }

    return {
      listOfExtractedData: extractedData,
      metadata: { requiresNotes: false }
    };
  }
}
