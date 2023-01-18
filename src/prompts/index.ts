export const GEN_OUTPUT_PROMPT = (dataPrompt: string, query: string) => {
  return `
  ${dataPrompt}\n Listed above is some data of financial information. Based on this data, execute the following query("${query}"). Output the answer in a structured JSON, where the property "explanation" contains a summary of the answers, while the values are interpolataed within the string and can be referenced in array called "values". Within the explanation, be detailed with dates, where the data was sourced and how the answer was calculated. All interopolated values should be preceded with an @ symbol and camel cased. The following is an example of the output format:
  { 
    "explanation": "Company X has @cashOnHand dollars on hand",
    "values": [
      { 
        "key": "cashOnHand", 
        "value": 1000000, 
        "unit": "$", // e.g. $, %, etc.
        "title": "Cash and cash equivalents"
        "statementSource": "BalanceSheets"
        "sectionSource": "CashAndCashEquivalentsAtCarryingValue.json"
        "date": "2019-12-31 to 2020-12-31"
        "multiplier: "NONE" |"IN_THOUSANDS" | "IN_MILLIONS"
      }
    ]
  }
  `;
};

export const GEN_SUMMARIZE_DATA_PROMPT = (
  dataPrompt: string,
  query: string
) => {
  return `
  ${dataPrompt}\n Listed above is some data of financial information. Based on the following query ("${query}"), extract relevant data to query and summarize them in JSON format. Be concise to save space. Specify dates, number and where the data was sourced.
  `;
};
