import { Configuration, OpenAIApi } from 'openai';
import LLMController from '../../schema/controllers/LLMController';

export default class GPT4Controller implements LLMController {
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
      model: 'gpt-4',
      messages: [{ role: 'user', content: text }],
      temperature: 0
    });

    const output = completion.data.choices[0].message?.content ?? '';
    console.log(`---\nOUTPUT: ${output}\n_____________`);
    return output;
  }
}
