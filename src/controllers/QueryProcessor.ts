import { Socket } from 'socket.io';
import { Service } from 'typedi';
import FilingPersistenceService from '../persistence/data/FilingPersistenceService';
import ProcessedFilingStorageService from '../persistence/storage/ProcessedFilingStorageService';
import { DataTraversalResult } from '../schema/dataTraversal/DataTraversalResult';
import { QueryUpdate } from '../schema/dataTraversal/QueryUpdate';
import { ProcessedFilingData } from '../schema/sec/FilingData';
import convertFinalOutputJSONToString from '../utils/convertFinalOutput';
import ChatController from './ChatController';
import LinearDataTraversalController from './DataTraversalControllers/LinearDataTraversalController';
import SimpleDataTraversalController from './DataTraversalControllers/SimpleDataTraversalController';
import InputToFilingProcessor from './InputToFilingProcessor';
import PromptDataProcessor from './PromptDataProcessor';

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
    chatController.setLoading(true);
    try {
      const response = await this.executeQuery(query, chatController);
      chatController.setLoading(false);
      chatController.sendMsgAndValues(response.answer, response.metadata);
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
    metadata: unknown;
    processedFiling: ProcessedFilingData;
  }> {
    if (query === undefined) {
      throw new Error('Query is undefined');
    }

    // 1. Get report data
    const { data: processedFilingData, secFiling } =
      await this.inputToFilingProcessor.processInput(query, chatController);

    await this.filingPersistenceService.createOrGetFiling(
      processedFilingData.id,
      secFiling
    );

    const simpleDataTraversalController = new SimpleDataTraversalController(
      processedFilingData
    );

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

    let result: DataTraversalResult;
    result = await simpleDataTraversalController.extractRelevantData(
      query,
      onExtractionUpdate
    );

    if (result.metadata.requiresNotes === true) {
      console.log('Query requires notes, moving to linear data traversal');
      const linearDataTraversalController = new LinearDataTraversalController(
        processedFilingData
      );
      // 1. We extract all the relevant data from the document
      result = await linearDataTraversalController.extractRelevantData(
        query,
        onExtractionUpdate
      );
      if (result.listOfExtractedData.length === 0)
        throw new Error(`No extracted data`);
    }
    // 2. Get data processor to process the extracted data and output answer
    onExtractionUpdate?.({ type: 'FINAL', name: 'FINAL' });
    const finalOutputJSON = await this.promptDataProcessor.processExtractedData(
      result.listOfExtractedData,
      query
    );

    const answer = convertFinalOutputJSONToString(finalOutputJSON);
    return {
      answer,
      metadata: { values: finalOutputJSON.values },
      processedFiling: processedFilingData
    };
  }
}
