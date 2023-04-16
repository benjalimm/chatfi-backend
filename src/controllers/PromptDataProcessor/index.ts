import { Service } from 'typedi';
import { GEN_OUTPUT_PROMPT, GEN_SUMMARIZE_DATA_PROMPT } from '../../prompts';
import LLMController from '../../schema/controllers/LLMController';
import { ExtractedData } from '../../schema/dataTraversal/ExtractedData';
import {
  FinalOutputData,
  FinalOutputJSON_EXAMPLE,
  Value,
  Value_EXAMPLE
} from '../../schema/dataTraversal/FinalPromptData';
import { validateBody } from '../../utils/validateObject';
import { extractJSONFromString } from '../DataTraversalControllers/Utils';
import LLMRoles from '../LLMControllers/LLMRoles';

const MAX_TOKENS_PER_PROMPT = 4000;

@Service()
export default class PromptDataProcessor {
  private llmController: LLMController;

  constructor() {
    this.llmController = LLMRoles.finalReasonLLM;
  }
  async processExtractedData(
    listOfExtractedData: ExtractedData[],
    query: string
  ): Promise<FinalOutputData> {
    console.log(`Processing ${listOfExtractedData.length} extracted data`);
    const dataPrompts: string[] = [];
    let currentPrompt = '';

    // 1.  Loop through extracted data and split prompts into chunks of 1800 tokens
    for (let i = 0; i < listOfExtractedData.length; i++) {
      // 1.1 Convert data to string
      const extractedData = listOfExtractedData[i];
      const extractedDataString =
        this.convertExtractedDataToString(extractedData);

      // 1.2 We check if the extracted data is over the max token limit, if so, we just push it into the data prompts as it will fail the proceeding checks.
      if (extractedDataString.length / 4 >= MAX_TOKENS_PER_PROMPT) {
        dataPrompts.push(extractedDataString);
        continue;
      }

      // 1.3 Check if adding the next data string will exceed 1800 tokens
      const nextPrompt = `${currentPrompt}${extractedDataString}`;
      if (nextPrompt.length / 4 > MAX_TOKENS_PER_PROMPT) {
        // 1.3.1 - If exceed, we store the current data prompt and start a new one
        dataPrompts.push(currentPrompt);
        currentPrompt = extractedDataString;
      } else {
        // 1.3.2 - If not exceed, we add the data string to the current prompt
        if (i === listOfExtractedData.length - 1) {
          dataPrompts.push(nextPrompt);
        } else {
          currentPrompt = nextPrompt;
        }
      }
    }

    if (dataPrompts.length === 0)
      throw new Error(`PromptDataProcessor - Data prompts do not exist`);

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
    return `${JSON.stringify(extractedData)}`;
  }

  private async processDataPrompt(
    dataPrompt: string,
    query: string
  ): Promise<FinalOutputData> {
    const finalOutputPrompt = GEN_OUTPUT_PROMPT(dataPrompt, query);
    const resultString = await this.llmController.executePrompt(
      finalOutputPrompt
    );
    const finalOutputJSON = this.extractAndValidateFinalOutput(resultString);
    return finalOutputJSON;
  }

  private async summarizeDataPrompt(
    dataPrompt: string,
    query: string
  ): Promise<string> {
    console.log(`SUMMARIZING DATA PROMPT: ${dataPrompt}`);
    const summarizeDataPrompt = GEN_SUMMARIZE_DATA_PROMPT(dataPrompt, query);
    return this.llmController.executePrompt(summarizeDataPrompt);
  }

  private extractAndValidateFinalOutput(result: string): FinalOutputData {
    const extractedFinalOutput = extractJSONFromString(result);
    const isValidBody = validateBody(
      extractedFinalOutput,
      FinalOutputJSON_EXAMPLE
    );

    if (isValidBody) {
      const values = extractedFinalOutput.values;

      if (values.length > 0) {
        values.forEach((value) => {
          const validated = validateBody<Value>(value, Value_EXAMPLE);

          if (!validated) {
            throw new Error(
              `Failed to validate value: ${JSON.stringify(value)}`
            );
          }
        });
        return extractedFinalOutput;
      }
      return extractedFinalOutput;
    }
    throw new Error(
      `Failed to validate final output JSON: ${JSON.stringify(result)}`
    );
  }
}
