import express, { Express, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

import dotenv from 'dotenv';
import OpenAIController from './controllers/OpenAIController';

dotenv.config();

const app: Express = express();
const port = 3000;

// Inject controllers
const openAIController = new OpenAIController();

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
    const text = await openAIController.executePrompt(query)
    res.json({ success: true, text})
  } catch (e) {
    res.json({ success: false, error: e})
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});