import { Configuration, OpenAIApi } from 'openai';
import EmbeddingsController from '../schema/controllers/EmbeddingController.js';
import LLMController from '../schema/controllers/LLMController.js';
import { EmbeddingData } from '../schema/EmbeddingTypes.js';

export default class OpenAIController
  implements LLMController, EmbeddingsController
{
  private api: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.api = new OpenAIApi(configuration);
  }

  async executePrompt(text: string): Promise<string> {
    const estimatedTokenCount = text.length / 4;
    console.log(
      `Executing prompt with estimated token count ${estimatedTokenCount}... \n_____________\nPROMPT: ${text}`
    );
    const completion = await this.api.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text }]
    });
    const output = completion.data.choices[0].message?.content ?? '';
    console.log(`---\nOUTPUT: ${output}\n_____________`);
    return output;
  }

  async getEmbedding(input: string): Promise<EmbeddingData> {
    const {
      data: { data: choiceEmbeddings }
    } = await this.api.createEmbedding({
      model: 'text-embedding-ada-002',
      input
    });

    return choiceEmbeddings[0] as EmbeddingData;
  }
}
