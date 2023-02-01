import { FirstOrderValue } from '../../../schema/FirstOrderValue';

export const GEN_CODE_EXECUTOR_GENERATION_PROMPT = (
  extractedValues: FirstOrderValue[],
  formulas: string[],
  query: string
) => {
  const stringifiedExtractedValues = stringifyExtractedValue(extractedValues);
  return `
  Values: \n${stringifiedExtractedValues}\n
  Formulas:\n ${formulas.map((formula) => formula + '\n')}
  User query: "${query}\n"
  Listed above are three things - values extracted from financial statements, a list of formulas and a query someone has made. Based on the info, output an executable function that represents an answer to the user's query with the values inputted into the arguments. You are allowed to augment the formulas to fit the query. Make sure to select values from the same date or date range. If no date is specified, default to the most date. If no range is specificied, default to the shorter range (e.g. Pick 3 months range over 9 months).
  
  Output the answer in a JSON format. Example: \n${OUTPUT_JSON} `;
};

const OUTPUT_JSON = `
{ 
  "output": "return (10000 / 50)"
}
`;

function stringifyExtractedValue(extractedValues: FirstOrderValue[]): string {
  let stringifiedValues = ``;
  for (const extractedValue of extractedValues) {
    stringifiedValues =
      stringifiedValues + `${JSON.stringify(extractedValue)}\n\n`;
  }
  return stringifiedValues;
}
