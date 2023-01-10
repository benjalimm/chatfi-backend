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
    console.log(`Executing prompt... \n_____________\nPROMPT: ${text}`)
    const completion = await this.api.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.4,
        max_tokens: 2049,
    });
    const output = completion.data.choices[0].text ?? "";
    console.log(`---\nOUTPUT: ${output}\n_____________`)
    return output;
  }
}