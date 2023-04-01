import express, { Express, Request, Response } from 'express';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as socketio from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAIController from './controllers/LLMControllers/OpenAIController';
import LinearDataTraversalController from './controllers/DataTraversalControllers/LinearDataTraversalController';
import SimpleDataTraversalController from './controllers/DataTraversalControllers/SimpleDataTraversalController';
import convertFinalOutputJSONToString from './utils/convertFinalOutput';
import PromptDataProcessor from './controllers/PromptDataProcessor';
import { QueryUpdate } from './schema/dataTraversal/QueryUpdate';
import { DataTraversalResult } from './schema/dataTraversal/DataTraversalResult';
import GPT4Controller from './controllers/LLMControllers/GPT4Controller';
import InputToFilingProcessor from './controllers/InputToFilingProcessor';
import ChatController from './controllers/ChatController';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Inject controllers
const openAIController = new OpenAIController();
const gpt4Controller = new GPT4Controller();
const inputReportDataGenerator = new InputToFilingProcessor(openAIController);

const promptDataProcessor = new PromptDataProcessor(gpt4Controller);

// Body parser middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Socket setup
const server = http.createServer(app);
const io = new socketio.Server(server, { cors: { origin: '*' } });

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

io.on('connection', async (socket) => {
  socket.emit('Connected');

  socket.on('query', async (data) => {
    const chatController = new ChatController(socket);
    console.log('RECEIVED QUERY ', data);
    const query = data.query as string;
    chatController.setLoading(true);

    try {
      const response = await executeQuery(query, chatController);
      chatController.setLoading(false);
      chatController.sendMsgAndValues(response.answer, response.metadata);
    } catch (e) {
      console.log(e);
      chatController.setLoading(false);
      chatController.sendMsg(`Oops, an error occurred. Error message: ${e}`);
    }
  });
});

async function executeQuery(
  query: string,
  chatController?: ChatController
): Promise<{
  answer: string;
  metadata: unknown;
}> {
  if (query === undefined) {
    throw new Error('Query is undefined');
  }

  // 1. Get report data
  const report = await inputReportDataGenerator.processInput(
    query,
    chatController
  );

  const simpleDataTraversalController = new SimpleDataTraversalController(
    openAIController,
    report
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
      openAIController,
      report
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
  const finalOutputJSON = await promptDataProcessor.processExtractedData(
    result.listOfExtractedData,
    query
  );

  const answer = convertFinalOutputJSONToString(finalOutputJSON);
  return {
    answer,
    metadata: { values: finalOutputJSON.values }
  };
}
