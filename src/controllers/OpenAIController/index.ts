import { Configuration, OpenAIApi } from "openai";


export default class OpenAIController {
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
        prompt: text
    });

    return completion.data.choices[0].text ?? "";
  }
}