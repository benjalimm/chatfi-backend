import { Socket } from 'socket.io';
import { Service } from 'typedi';
import FilingPersistenceService from '../../persistence/data/FilingPersistenceService';
import ProcessedFilingStorageService from '../../persistence/storage/ProcessedFilingStorageService';
import { DataTraversalResult } from '../../schema/dataTraversal/DataTraversalResult';
import { Value } from '../../schema/dataTraversal/FinalPromptData';
import { QueryUpdate } from '../../schema/dataTraversal/QueryUpdate';
import { StatementData } from '../../schema/response/StatementData';
import { ProcessedFilingData } from '../../schema/sec/FilingData';
import convertFinalOutputJSONToString from '../../utils/convertFinalOutput';
import { convertProcessedSectionToCombinedTextOrLineItems } from '../../utils/convertProcessedFilings';
import ChatController from '../ChatController';
import LinearDataTraversalController from '../DataTraversalControllers/LinearDataTraversalController';
import SimpleDataTraversalController from '../DataTraversalControllers/SimpleDataTraversalController';
import InputToFilingProcessor from '../InputToFilingProcessor';
import PromptDataProcessor from '../PromptDataProcessor';

@Service()
export default class QueryProcessor {
  private inputToFilingProcessor: InputToFilingProcessor;
  private filingPersistenceService: FilingPersistenceService;
  private promptDataProcessor: PromptDataProcessor;
  private processedFilingService: ProcessedFilingStorageService;

  constructor(
    inputToFilingProcessor: InputToFilingProcessor,
    filingPersistenceService: FilingPersistenceService,
    promptDataProcessor: PromptDataProcessor,
    processedFilingService: ProcessedFilingStorageService
  ) {
    this.inputToFilingProcessor = inputToFilingProcessor;
    this.filingPersistenceService = filingPersistenceService;
    this.promptDataProcessor = promptDataProcessor;
    this.processedFilingService = processedFilingService;
  }

  async processQuery(query: string, socket: Socket) {
    const chatController = new ChatController(socket);

    // 1. Set chat loading to true
    chatController.setLoading(true);
    try {
      // 2. Process query to generate answer + corresponding data
      const response = await this.executeQuery(query, chatController);

      console.log(`ListOfStatementData: ${response.listOfStatementData}}`);

      // 3.1 Stop loading + send answer and data
      chatController.setLoading(false);
      chatController.sendMsgAndMetadata(response.answer, {
        values: response.values,
        listOfStatementData: response.listOfStatementData
      });

      // 4. Store processed filing in storage
      await this.processedFilingService.putReport(response.processedFiling);
    } catch (e) {
      console.log(e);
      chatController.setLoading(false);
      chatController.sendMsg(`Oops, an error occurred. Error message: ${e}`);
    }
  }

  async executeQuery(
    query: string,
    chatController?: ChatController
  ): Promise<{
    answer: string;
    values: Value[];
    processedFiling: ProcessedFilingData;
    listOfStatementData: StatementData[];
  }> {
    if (query === undefined) {
      throw new Error('Query is undefined');
    }

    // 1. Process query input to generated corresponding SEC filing and processed filing data
    const { data: processedFilingData, secFiling } =
      await this.inputToFilingProcessor.processInput(query, chatController);

    // 2. Store filing in persistence
    // TODO: Reassess putting this here as pFiling not yet persisted in storage
    await this.filingPersistenceService.createOrGetFiling(
      processedFilingData.id,
      secFiling
    );

    // Define a callback function to be called when extraction is updated
    const onExtractionUpdate = (update: QueryUpdate) => {
      switch (update.type) {
        case 'STATEMENT':
          chatController?.sendMsg(`Looking through document "${update.name}"`);
          break;
        case 'SECTION': {
          break;
        }

        case 'FINAL':
          chatController?.sendMsg(
            `I've gathered the relevant information. Organizing the data and preparing a summary for you now...`
          );
          break;
      }
    };

    const simpleDataTraversalController = new SimpleDataTraversalController(
      processedFilingData
    );

    let result: DataTraversalResult;
    // 3. Start by running the query through the simple data traversal controller
    result = await simpleDataTraversalController.extractRelevantData(
      query,
      onExtractionUpdate
    );

    // 4. If the query requires more than simple data traveral, we run the query through the linear data traversal controller
    if (result.metadata.requiresNotes === true) {
      console.log('Query requires notes, moving to linear data traversal');
      const linearDataTraversalController = new LinearDataTraversalController(
        processedFilingData
      );
      result = await linearDataTraversalController.extractRelevantData(
        query,
        onExtractionUpdate
      );
      if (result.listOfExtractedData.length === 0)
        throw new Error(`No extracted data`);
    }
    onExtractionUpdate?.({ type: 'FINAL', name: 'FINAL' });

    // 5. Process the extracted data into a final output JSON
    const finalOutputJSON = await this.promptDataProcessor.processExtractedData(
      result.listOfExtractedData,
      query
    );

    // 6. We extract out the statement data from the values
    const listOfStatementData = this.getRelevantStatementDataFromValues(
      finalOutputJSON.values,
      processedFilingData
    );

    // 7. Convert final output JSON into answer string
    const answer = convertFinalOutputJSONToString(finalOutputJSON);
    return {
      answer,
      values: finalOutputJSON.values,
      processedFiling: processedFilingData,
      listOfStatementData
    };
  }

  private getRelevantStatementDataFromValues(
    values: Value[],
    processedFiling: ProcessedFilingData
  ): StatementData[] {
    const statements: string[] = [];

    // 1. Get all the statement sources
    for (const value of values) {
      const statementSource = value.statementSource;
      if (!statements.includes(statementSource)) {
        statements.push(statementSource);
      }
    }

    // 2. Get all the statement data
    const listOfStatementData: StatementData[] = [];
    for (const statementKey of statements) {
      const processedStatementData = processedFiling.statements[statementKey];

      if (processedStatementData) {
        // Distinguish between Line items and text
        const sectionData = convertProcessedSectionToCombinedTextOrLineItems(
          processedStatementData.sections
        );
        const dataType =
          typeof sectionData === 'string' ? 'TEXT' : 'LINE_ITEMS';

        const data =
          dataType === 'TEXT'
            ? (sectionData as string)
            : JSON.stringify(sectionData);

        listOfStatementData.push({
          filingId: values[0].filingId,
          statement: statementKey,
          type: dataType,
          data: data
        });
      }
    }

    return listOfStatementData;
  }
}
