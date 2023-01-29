import { text } from 'body-parser';
import 'jest';
import GeneratedCodeExecutor from '../../src/controllers/QuantitativeServices/GeneratedCodeExecutor';
import OpenAIController from '../../src/controllers/OpenAIController';
import { ExtractedValue } from '../../src/schema/ExtractedValue';
import QuantitativeQueryProcessor from '../../src/controllers/QuantitativeServices/QuantitativeQueryProcessor';

describe('Testing quantitative query', () => {
  // test('Code generation should work', async () => {
  //   jest.setTimeout(20000);
  //   const openAIController = new OpenAIController();
  //   const generatedCodeExecutor = new GeneratedCodeExecutor(openAIController);
  //   const extractedValues: ExtractedValue[] = [
  //     {
  //       name: 'Current asset',
  //       type: 'INSTANT',
  //       values: [{ value: 1000000, unit: '$', date: '2022-09-30' }]
  //     },
  //     {
  //       name: 'Current liabilities',
  //       type: 'INSTANT',
  //       values: [{ value: 500000, unit: '$', date: '2022-09-30' }]
  //     },
  //     {
  //       name: 'Inventory',
  //       type: 'INSTANT',
  //       values: [{ value: 200000, unit: '$', date: '2022-09-30' }]
  //     }
  //   ];
  //   const formula = 'Quick ratio = Current assets / Current liabilities';
  //   const query =
  //     'What is the quick ratio for 2022? Make sure to deduct the inventory from current assets before calculating.';
  //   const executableString = await generatedCodeExecutor.outputExecutable(
  //     [formula],
  //     extractedValues,
  //     query
  //   );
  //   console.log(`ExecutableString:\n${executableString}`);
  //   const result = new Function(executableString)() as number;
  //   console.log(`RESULT: ${result}`);
  //   expect(result).toBe(1.6);
  // });

  test('Test', async () => {
    jest.setTimeout(20000);
    const processor = new QuantitativeQueryProcessor(new OpenAIController());
    const result = await processor.processQuery(
      'What is the quick ratio for 2022?'
    );
    expect(result).toBe(2);
  });
});
