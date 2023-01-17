import 'jest';
import { GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT } from '../../src/controllers/DataTraversalControllers/Prompts';
import { readTxt } from '../../src/controllers/DataTraversalControllers/Utils';
import OpenAIController from '../../src/controllers/OpenAIController';

const openAIController = new OpenAIController();
describe('LLM parsing tests', () => {
  jest.setTimeout(20000);
  it('Should parse TXT files correctly', async () => {
    const statement = 'RESTRUCTURING';
    const section = 'RestructuringAndRelatedActivitiesDisclosureTextBlock.txt';
    const data = readTxt(
      `../../sampleData/COINBASE_10_Q/${statement}/${section}`
    );
    const query = "Give me a summary of Coinbase's restructuring costs";

    const prompt = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(
      statement,
      data,
      query
    );
    const extractedData = await openAIController.executePrompt(prompt);
    console.log(`Extracted data: ${extractedData}`);
    expect(extractedData).toBeDefined();
  });
});
