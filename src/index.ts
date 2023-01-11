import express, { Express, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAIController from './controllers/OpenAIController';
import LinearDataTraversalController from './controllers/DataTraversalControllers/LinearLLMSearchController';
import { INFER_ANSWER_PROMPT, PRECAUTIONS_PROMPT } from './prompts';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Inject controllers
const openAIController = new OpenAIController();

const linearSearchController = new LinearDataTraversalController(
  openAIController,
  '../../sampleData/COINBASE_10_Q' // This file path needs to be subjective to it's folder location
);

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
    const documentJsonStrings =
      await linearSearchController.generateFinalPrompt(query);

    // 2. Get LLM to infer answer
    const prompt =
      documentJsonStrings + INFER_ANSWER_PROMPT + query + PRECAUTIONS_PROMPT;
    const answer = await openAIController.executePrompt(prompt);

    res.json({ success: true, query, answer });
  } catch (error) {
    console.log(`ERROR: ${error}`);
    res.status(500).json({ success: false, error: `${error}` });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
