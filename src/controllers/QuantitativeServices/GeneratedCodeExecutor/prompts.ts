import { FirstOrderValue } from '../../../schema/FirstOrderValue.js';
import { Formula } from '../../../schema/FormulaType.js';

export const GEN_CODE_EXECUTOR_GENERATION_PROMPT = (
  extractedValues: FirstOrderValue[],
  formulas: Formula[],
  query: string
) => {
  const stringifiedExtractedValues = stringifyExtractedValue(extractedValues);
  return `
  JSON data values: \n${stringifiedExtractedValues}\n
  Formulas:\n ${formulas.map(
    (formula) => `(${formula.name} = ${formula.formula})` + '\n'
  )}
  Listed above are three things - values extracted from financial statements and a list of relevant formulas. Based on the following user query ("${query}"), select the relevant values and output a calculation of the answer. Return a string in the property "output" that is can be executed manually in javascript (e.g. "return 1000 / 50"). You might have to piece together multiple formulas together to get the answer. Only select values from start date 2022-01-01 to end date 2022-09-30. \n

  ${PRECAUTIONS_AND_ALLOWANCES}

  Output the answer in a JSON format. Example: \n${OUTPUT_JSON} `;
};

const PRECAUTIONS_AND_ALLOWANCES = `
Look at the formulas carefully and piece them together, DO NOT miss out on any important information. Don't make mistakes such as adding a value instead of subtracting. Never manually calculate numbers yourself, only input the respective values into the respective formulas. Make sure to select values from the same date or date range (e.g. Do not select 3 months ending if users asks for 9 months ending). Dates are yyyy-mm-dd. If no date is specified, default to the most recent date. If no range is specificied, default to the latest range (e.g. 9 months ending Sept 2022). If a value doesn't exist, simply assume it is 0.
`;

// const PRECAUTIONS_AND_ALLOWANCES = `If a value doesn't exist, simply assume it is 0. Make sure to select values from the correct date / ranges. For example, if the user asks for 9 months ending Sept 2022, make sure to select values with a start date roughly 9 months prior to Sept 2022 and an end date of Sept 2022. If no date is specified, default to the most recent date. If no range is specificied, default to the latest range (e.g. 9 months ending Sept 2022).
// `;

const OUTPUT_JSON = `
{ 
  "output": string // e.g. "return 1000 / 50"
  "formula": string // e.g. "Current asset / current liabilities"
  "period": { 
    "startDate": string, // e.g. 2022-01-01
    "endDate": string // e.g. 2022-09-30
  }
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
