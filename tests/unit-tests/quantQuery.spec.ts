import { text } from 'body-parser';
import 'jest';
import GeneratedCodeExecutor from '../../src/controllers/GeneratedCodeExecutor';
import OpenAIController from '../../src/controllers/OpenAIController';
import { ExtractedValue } from '../../src/schema/ExtractedValue';

describe('Code generation testing', () => {
  test('Code generation should work', async () => {
    jest.setTimeout(20000);
    const openAIController = new OpenAIController();
    const generatedCodeExecutor = new GeneratedCodeExecutor(openAIController);
    const extractedValues: ExtractedValue[] = [
      {
        name: 'Current asset',
        type: 'INSTANT',
        values: [{ value: 1000000, unit: '$', date: '2022-09-30' }]
      },
      {
        name: 'Current liabilities',
        type: 'INSTANT',
        values: [{ value: 500000, unit: '$', date: '2022-09-30' }]
      }
    ];

    const formula = 'Quick ratio = Current assets / Current liabilities';

    const executableString = await generatedCodeExecutor.outputExecutable(
      formula,
      extractedValues,
      '2022'
    );
    console.log(`ExecutableString:\n${executableString}`);
    const result = new Function(executableString)() as number;
    console.log(`RESULT: ${result}`);
    expect(result).toBe(2);
  });
});
