import { text } from 'body-parser';
import 'jest';
import GeneratedCodeExecutor from '../../src/controllers/QuantitativeServices/GeneratedCodeExecutor';
import OpenAIController from '../../src/controllers/OpenAIController';
import {
  FirstOrderValue,
  FOVExtractionInstruction
} from '../../src/schema/FirstOrderValue';
import QuantitativeQueryProcessor from '../../src/controllers/QuantitativeServices/QuantitativeQueryProcessor';
import FirstOrderValueIndexer from '../../src/controllers/FirstOrderValueIndexer';
import instructions from '../../extractions/instructions';

describe('Testing quantitative query', () => {
  const openAIController = new OpenAIController();

  // test('Test', async () => {
  //   jest.setTimeout(20000);
  //   const processor = new QuantitativeQueryProcessor(openAIController);
  //   const result = await processor.processQuery(
  //     'What is quick ratio for three months ending Sept 2022?'
  //   );
  //   console.log(`Result: ${result}`);
  //   expect(result).toBe(1.05);
  // });
  jest.setTimeout(20000);
  test('First order value indexing', async () => {
    const indexer = new FirstOrderValueIndexer(
      '../../sampleData/COINBASE_10_Q',
      '',
      instructions,
      openAIController
    );
    await indexer.beginIndexing();
  });
});
