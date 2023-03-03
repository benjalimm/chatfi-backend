import express, { Express, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as socketio from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAIController from './controllers/OpenAIController';
import LinearDataTraversalController from './controllers/DataTraversalControllers/LinearDataTraversalController';
import WaterfallDataTraversalController from './controllers/DataTraversalControllers/WaterfallDataTraversalController';
import SimpleDataTraversalController from './controllers/DataTraversalControllers/SimpleDataTraversalController';
import convertFinalOutputJSONToString from './utils/convertFinalOutput';
import PromptDataProcessor from './controllers/PromptDataProcessor';
import { QueryUpdate } from './schema/QueryUpdate';
import { DataTraversalResult } from './schema/DataTraversalResult';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Inject controllers
const openAIController = new OpenAIController();

const simpleDataTraversalController = new SimpleDataTraversalController(
  openAIController,
  '../../sampleData/COINBASE_10_Q' // This file path needs to be subjective to it's folder location
);

const linearDataTraversalController = new LinearDataTraversalController(
  openAIController,
  '../../sampleData/COINBASE_10_Q' // This file path needs to be subjective to it's folder location
);

const promptDataProcessor = new PromptDataProcessor(openAIController);

// Body parser middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Socket setup
const server = http.createServer(app);
const io = new socketio.Server(server, { cors: { origin: '*' } });

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/', async (req: Request, res: Response) => {
  const query = req.body.query;
  console.log('BODY:');
  console.log(req.body);

  try {
    const { answer, metadata } = await executeQuery(query);

    res.json({
      success: true,
      query,
      answer,
      metadata
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json({ success: false, error: `${error}` });
  }
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

io.on('connection', async (socket) => {
  socket.emit('Connected');
  socket.on('query', async (data) => {
    console.log('RECEIVED QUERY ', data);
    const query = data.query as string;
    emitLoading(socket, true);

    try {
      const response = await executeQuery(query, (update) => {
        switch (update.type) {
          case 'STATEMENT':
            emitMsgOnly(socket, `Looking through document "${update.name}"`);
            break;
          case 'SECTION': {
            break;
          }

          case 'FINAL':
            emitMsgOnly(
              socket,
              `I've gathered the relevant information. Organizing the data and preparing a summary for you now...`
            );
            break;
        }
      });
      emitLoading(socket, false);
      emit(socket, 'message', response);
    } catch (e) {
      console.log(e);
      emitLoading(socket, false);
      emitMsgOnly(socket, `Oops, an error occurred. Error message: ${e}`);
    }
  });
});

async function executeQuery(
  query: string,
  onExtractionUpdate?: (statement: QueryUpdate) => void
): Promise<{
  answer: string;
  metadata: unknown;
}> {
  if (query === undefined) {
    throw new Error('Query is undefined');
  }
  let result: DataTraversalResult;
  result = await simpleDataTraversalController.extractRelevantData(
    query,
    onExtractionUpdate
  );

  if (result.metadata.requiresNotes === true) {
    console.log('Query requires notes, moving to linear data traversal');
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

function emit(
  socket: socketio.Socket,
  event: 'message' | 'loading',
  data: any
) {
  socket.emit(event, JSON.stringify({ data }));
}

function emitMsgOnly(socket: socketio.Socket, message: string) {
  emit(socket, 'message', { answer: message });
}

function emitLoading(socket: socketio.Socket, loading: boolean) {
  emit(socket, 'loading', { loading });
}
