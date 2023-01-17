import { GEN_OUTPUT_PROMPT, GEN_SUMMARIZE_DATA_PROMPT } from '../prompts';
import LLMController from '../schema/controllers/LLMController';
import { ExtractedData } from '../schema/ExtractedData';
import { FinalOutputJSON } from '../schema/FinalPromptJSON';
import { extractJSONFromString } from './DataTraversalControllers/Utils';

const MAX_TOKENS_PER_PROMPT = 1300;
export default class PromptDataProcessor {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }
  async processExtractedData(
    listOfExtractedData: ExtractedData[],
    query: string
  ): Promise<FinalOutputJSON> {
    const dataPrompts: string[] = [];
    let currentPrompt = '';

    // 1.  Loop through extracted data and split prompts into chunks of 1800 tokens
    for (let i = 0; i < listOfExtractedData.length; i++) {
      // 1.1 Convert data to string
      const extractedData = listOfExtractedData[i];
      const extractedDataString =
        this.convertExtractedDataToString(extractedData);

      // 1.2 Check if adding the next data string will exceed 1800 tokens
      const nextPrompt = `${currentPrompt}${extractedDataString}`;
      if (nextPrompt.length / 4 > MAX_TOKENS_PER_PROMPT) {
        // 1.2.1 - If exceed, we store the current data prompt and start a new one
        dataPrompts.push(currentPrompt);
        currentPrompt = extractedDataString;
      } else {
        // 1.2.2 - If not exceed, we add the data string to the current prompt
        currentPrompt = nextPrompt;
      }
    }

    // 2. If only one data prompt exist, we process and return it
    if (dataPrompts.length === 1) {
      return this.processDataPrompt(dataPrompts[0], query);
    }
    console.log('DATA PROMPT TOO LONG, SPLITTING INTO MULTIPLE PROMPTS ');

    // 3. If more than one data prompt exist, we process them in parallel
    const asyncs: Promise<string>[] = [];
    dataPrompts.forEach((prompt) => {
      asyncs.push(this.summarizeDataPrompt(prompt, query));
    });
    const outputs = await Promise.all(asyncs);

    // 4. Join string
    let finalDataPrompt = '';
    outputs.forEach((prompt) => {
      finalDataPrompt = `${finalDataPrompt}${prompt}`;
    });
    return this.processDataPrompt(finalDataPrompt, query);
  }
  private convertExtractedDataToString(extractedData: ExtractedData): string {
    return ` ----\n Info from statement ${extractedData.statement} in section ${extractedData.segment}:
      ${extractedData.data}\n----
      `;
  }

  private async processDataPrompt(
    dataPrompt: string,
    query: string
  ): Promise<FinalOutputJSON> {
    const finalOutputPrompt = GEN_OUTPUT_PROMPT(dataPrompt, query);
    const resultString = await this.llmController.executePrompt(
      finalOutputPrompt
    );
    const finalOutputJSON = extractJSONFromString(
      resultString
    ) as FinalOutputJSON; // TODO: Do proper type check
    return finalOutputJSON;
  }

  private async summarizeDataPrompt(
    dataPrompt: string,
    query: string
  ): Promise<string> {
    const summarizeDataPrompt = GEN_SUMMARIZE_DATA_PROMPT(dataPrompt, query);
    return this.llmController.executePrompt(summarizeDataPrompt);
  }
}
