import { PREVENT_HALLUCINATION } from './reusables';

const OUTPUT_JSON = `
{ 
    "answer": " Company X has cash and cash equivalents of @cashOnHand. This is sourced from the balance sheet",
    "values": [
      { 
        "key": "cashOnHand", // type: string
        "value": "1000000" | "2,945"  // type: string 
        "unit": "DOLLARS" | "PERCENTAGE" | "NONE"
        "title": "Cash and cash equivalents"
        "statementSource": "BalanceSheets" // Find statementSource for this value
        "sectionSource": "CashAndCashEquivalentsAtCarryingValue.json" // Find sectionSource for this value
        "filingId": "ZM_10K_2021-12-31" // Find filingId for this value
        "multiplier": "NONE" | "IN_HUNDREDS" | "IN_THOUSANDS" | "IN_MILLIONS" | 
        "valueType": "REFERENCED" | "COMPUTED" // Was value computed or referenced from a source
      }
    ]
  }
`;

const OUTPUT_DETAILS = `Output the answer in a structured JSON, where the property "answer" contains a summary of the answer and how it was calculated, while the values are interpolated within the string and can be referenced in array called "values". In the answer, be detailed with dates, where the data was sourced and how the answer was calculated. Reference as many values provided in the context as possible.  All interpolated values should be preceded with an @ symbol and camel cased. (e.g. cash should be @cash) Make sure not to add any extraneous letters or symbols that would prevent us from interpolating the values. We should be  All values in the answer should be listed in the values array. Ensure the JSON is valid and the properties have quotes on them (e.g. "answer" / "values"). If a property within the value is not relevant to it, simply leave it as an empty string.`;

const OUTPUT_PRECAUTIONS = `When calculating / comparing values, make sure they fall within the same dates / periods. If a value has a multiplier attached to it (e.g. IN_THOUSANDS), apply the multiplier to it. 
`;

export const GEN_OUTPUT_PROMPT = (dataPrompt: string, query: string) => {
  return `
  Listed below is some data of financial information.

  Context:\n
  ${dataPrompt}\n 

  Based on only data provided in the context, answer the following query ("${query}").

  ${OUTPUT_PRECAUTIONS}
  ${OUTPUT_DETAILS} 
  ${PREVENT_HALLUCINATION(
    `Say: "There is not enough data to answer this question"`
  )}
  Here is an example JSON:
  ${OUTPUT_JSON}
  `;
};

export const GEN_SUMMARIZE_DATA_PROMPT = (
  dataPrompt: string,
  query: string
) => {
  return `
  Context:\n
  ${dataPrompt}\n Listed above is some data of financial information. Based on the following query ("${query}"), extract the most relevant data to the query and condense the data as much as possible within JSON format. Be as concise as possible to save space without losing context. Specify dates, number and where the data was sourced.
  `;
};
