import { text } from 'body-parser';
import 'jest';
import GeneratedCodeExecutor from '../../src/controllers/QuantitativeServices/GeneratedCodeExecutor/index.js';
import OpenAIController from '../../src/controllers/OpenAIController.js';
import {
  FirstOrderValue,
  FOVExtractionInstruction
} from '../../src/schema/FirstOrderValue.js';
import QuantitativeQueryProcessor from '../../src/controllers/QuantitativeServices/QuantitativeQueryProcessor.js';
import FirstOrderValueIndexer from '../../src/controllers/FirstOrderValueIndexer/index.js';
import instructions from '../../extractions/instructions.js';

describe('Testing quantitative query', () => {
  const openAIController = new OpenAIController();
  jest.setTimeout(200000);

  test('Test', async () => {
    jest.setTimeout(20000);
    const processor = new QuantitativeQueryProcessor(openAIController);
    const result = await processor.processQuery(
      'What is the quick ratio for 9 months ending 2022?'
    );
    console.log(`Result: ${result}`);
    expect(result).toBe(1.05);
  });

  // test('First order value indexing', async () => {
  //   jest.setTimeout(200000);

  //   const indexer = new FirstOrderValueIndexer(
  //     '../../sampleData/COINBASE_10_Q',
  //     '',
  //     instructions,
  //     openAIController
  //   );
  //   await indexer.beginIndexing();
  // });
});
