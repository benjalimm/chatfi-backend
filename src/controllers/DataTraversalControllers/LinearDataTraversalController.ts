import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import { ExtractedData } from '../../schema/ExtractedData';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';
import { DataTraversalResult } from '../../schema/DataTraversalResult';
import { QueryUpdate } from '../../schema/QueryUpdate';

const MAX_STATEMENTS = 3;
const MAX_SEGMENTS = 6;

export default class LinearDataTraversalController
  extends BaseDataTraversalContoller
  implements LLMDataTraversalController
{
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    this.listOfStatements = reportMetadata.statements;
  }

  async extractRelevantData(
    query: string,
    onExtractionUpdate?: (update: QueryUpdate) => void
  ): Promise<DataTraversalResult> {
    // 1. Get list of pertinent statements
    const extractedStatementsResponse =
      await this.extractRelevantStatementsFromQuery(MAX_STATEMENTS, query);

    console.log('DOCUMENT TYPE RESPONSE: ');
    console.log(extractedStatementsResponse);

    // 1.1 - We store extracted pertinent info in this array
    const extractedData: ExtractedData[] = [];

    for (const statementFile of extractedStatementsResponse.statements) {
      onExtractionUpdate?.({ type: 'STATEMENT', name: statementFile });
      try {
        const extractedSegmentsMetadata =
          await this.extractRelevantSectionsFromStatement(
            MAX_SEGMENTS,
            statementFile,
            query
          );

        // 5. For each segment, get the data and ask LLM to extract the pertinent data
        for (const segment of extractedSegmentsMetadata.segments) {
          onExtractionUpdate?.({ type: 'SECTION', name: segment });

          try {
            const extractedDataFromSegment = await this.extractDataFromSegment(
              segment,
              statementFile,
              query
            );
            extractedData.push(extractedDataFromSegment);
          } catch (e) {
            console.log(
              `Caught error at segment level: ${e}\n...Continuing loop`
            );
            continue;
          }
        }
      } catch (e) {
        console.log(
          `Caught error at statement level: ${e}\n...Continuing loop`
        );
      }
    }

    return { listOfExtractedData: extractedData, metadata: null };
  }
}
