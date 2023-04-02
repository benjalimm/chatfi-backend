import LLMController from '../../schema/controllers/LLMController';
import { ExtractedData } from '../../schema/dataTraversal/ExtractedData';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';
import LLMDataTraversalController from '../../schema/controllers/LLMDataTraversalController';
import { DataTraversalResult } from '../../schema/dataTraversal/DataTraversalResult';
import { QueryUpdate } from '../../schema/dataTraversal/QueryUpdate';
import { isFulfilled } from '../../utils/PromiseExtensions';
import { ProcessedFilingData } from '../../schema/sec/FilingData';

const MAX_STATEMENTS = 6;
const MAX_SEGMENTS = 10;

export default class LinearDataTraversalController
  extends BaseDataTraversalContoller
  implements LLMDataTraversalController
{
  constructor(llmController: LLMController, report: ProcessedFilingData) {
    super(llmController, report);
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

    // 1.1 - We store the pr
    const unresolvedExtractedDataPromise: Promise<ExtractedData[]>[] = [];

    for (const statementFile of extractedStatementsResponse.statements) {
      onExtractionUpdate?.({ type: 'STATEMENT', name: statementFile });
      try {
        const dataExtractionPromise = this.extractSectionsAndThenData(
          statementFile,
          MAX_SEGMENTS,
          query,
          onExtractionUpdate
        );
        unresolvedExtractedDataPromise.push(dataExtractionPromise);
      } catch (e) {
        console.log(
          `Caught error at statement level: ${e}\n...Continuing loop`
        );
      }
    }

    // Resolve asynchronously
    const settledResults = await Promise.allSettled(
      unresolvedExtractedDataPromise
    );

    const listOfExtractedData = settledResults
      .filter(isFulfilled)
      .map((p) => p.value);

    const extractedData = listOfExtractedData.flatMap((v) => {
      return v;
    });

    return { listOfExtractedData: extractedData, metadata: null };
  }

  private async extractSectionsAndThenData(
    statementFile: string,
    maxSegments: number,
    query: string,
    onExtractionUpdate?: (update: QueryUpdate) => void
  ): Promise<ExtractedData[]> {
    // Step 1 - Extract relevant sections from statement
    const extractedSegmentsMetadata =
      await this.extractRelevantSectionsFromStatement(
        maxSegments,
        statementFile,
        query
      );

    const unresolvedExtractedDataPromises: Promise<ExtractedData>[] = [];

    // 2. For each segment, get the data and ask LLM to extract the pertinent data
    extractedSegmentsMetadata.segments.forEach((segment) => {
      unresolvedExtractedDataPromises.push(
        this.extractDataFromSegment(segment, statementFile, query)
      );
    });

    onExtractionUpdate?.({ type: 'SECTION', name: statementFile });

    // 3. Process data asyncronously
    const settledResults = await Promise.allSettled(
      unresolvedExtractedDataPromises
    );

    const fulfilledValues = settledResults
      .filter(isFulfilled)
      .map((p) => p.value);
    return fulfilledValues;
  }
}
