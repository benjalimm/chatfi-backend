import express, { Express, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

import dotenv from 'dotenv';
import OpenAIController from './controllers/OpenAIController';
import MockFinancialStatementManager from './controllers/MockFinancialStatementManager';
import { INFER_ANSWER_PROMPT, PRECAUTIONS_PROMPT } from './prompts';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Inject controllers
const openAIController = new OpenAIController();

const mockFinancialStatementManager = 
new MockFinancialStatementManager(openAIController);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/', async (req: Request, res: Response) => {
  const query = req.body.query
  console.log(`KEY: ${process.env.OPENAI_API_KEY}`)

  try {

    // 1. This here is a large string of financial statement(s) as stringified JSON
    const documentJsonStrings = await mockFinancialStatementManager.getDocumentStringsFromQuery(query);

    console.log(`DOCUMENT JSON STRINGS: ${documentJsonStrings}`)

    // 2. Get LLM to infer answer
    const prompt = documentJsonStrings + INFER_ANSWER_PROMPT + query + PRECAUTIONS_PROMPT;
    console.log(`FINAL PROMPT: ${prompt}`)
    const answer = await openAIController.executePrompt(prompt);

    res.json({ success: true, query, answer})
  } catch (e) {
    res.json({ success: false, error: e})
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
