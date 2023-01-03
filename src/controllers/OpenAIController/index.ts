import { Configuration, OpenAIApi } from "openai";
import LLMController from "../../schema/controllers/LLMController";


export default class OpenAIController implements LLMController {
  private api: OpenAIApi;

  constructor() {
    const configuration = new Configuration({ 
      apiKey: `${process.env.OPENAI_API_KEY}`
    });
    this.api = new OpenAIApi(configuration);
  }

  async executePrompt(text: string): Promise<string> {
    const completion = await this.api.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.6,
        max_tokens: 2049,
    });

    console.log(completion.data.choices)
    return completion.data.choices[0].text ?? "";
  }
}