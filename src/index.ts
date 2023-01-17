import express, { Express, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAIController from './controllers/OpenAIController';
import LinearDataTraversalController from './controllers/DataTraversalControllers/LinearDataTraversalController';
import { GEN_OUTPUT_PROMPT } from './prompts';
import WaterfallDataTraversalController from './controllers/DataTraversalControllers/WaterfallDataTraversalController';
import SimpleDataTraversalController from './controllers/DataTraversalControllers/SimpleDataTraversalController';
import { extractJSONFromString } from './controllers/DataTraversalControllers/Utils';
import convertFinalOutputJSONToString from './utils/convertFinalOutput';
import { FinalOutputJSON } from './schema/FinalPromptJSON';
import PromptDataProcessor from './controllers/PromptDataProcessor';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Inject controllers
const openAIController = new OpenAIController();

const dataTraversalController = new LinearDataTraversalController(
  openAIController,
  '../../sampleData/COINBASE_10_Q' // This file path needs to be subjective to it's folder location
);

const promptDataProcessor = new PromptDataProcessor(openAIController);

// Body parser middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/', async (req: Request, res: Response) => {
  const query = req.body.query;
  console.log('BODY:');
  console.log(req.body);

  try {
    if (query === undefined) {
      throw new Error('Query is undefined');
    }

    // 1. This here is a large string of financial statement(s) as stringified JSON
    const result = await dataTraversalController.extractRelevantData(query);
    if (result.listOfExtractedData.length === 0)
      throw new Error(`No extracted data`);

    // 2. Get data processor to process the extracted data and output answer
    const finalOutputJSON = await promptDataProcessor.processExtractedData(
      result.listOfExtractedData,
      query
    );

    const answer = convertFinalOutputJSONToString(finalOutputJSON);

    res.json({
      success: true,
      query,
      answer,
      metadata: { values: finalOutputJSON.values }
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
    res.status(500).json({ success: false, error: `${error}` });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
