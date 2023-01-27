import { ExtractedValue } from '../../schema/ExtractedValue';

export const GEN_CODE_EXECUTOR_GENERATION_PROMPT = (
  extractedValues: ExtractedValue[],
  formulaString: string,
  dateString: string
) => {
  const stringifiedExtractedValues = stringifyExtractedValue(extractedValues);
  return `
  Values: \n${stringifiedExtractedValues}\n
  Formula:\n ${formulaString}\n
  Date / range: ${dateString}\n
  Above are values extracted from financial statements and a formula. Output a javascript function that represents the completed formula with the values inputted into the arguments. Output the answer in a JSON format. Example: \n${OUTPUT_JSON} `;
};

const OUTPUT_JSON = `
{ 
  "output": "return (10000 / 50)"
}
`;

function stringifyExtractedValue(extractedValues: ExtractedValue[]): string {
  let stringifiedValues = ``;
  for (const extractedValue of extractedValues) {
    stringifiedValues =
      stringifiedValues + `${JSON.stringify(extractedValue)}\n\n`;
  }
  return stringifiedValues;
}
