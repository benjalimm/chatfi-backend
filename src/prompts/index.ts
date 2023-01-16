export const INFER_ANSWER_PROMPT = ` 
  Above is some JSON data of financial information. Based on the following information, execute the following query. Output the answer in dot points.
  Query: 
  `;

export const PRECAUTIONS_PROMPT = `
  Specify numbers and dates if possible. All dollar amount should start with the $ symbol. Look closely at the values listed in the JSON and be careful of making mistakes (e.g. Do not output $300 as $3000)

  Start the answer with a concise summary follow by explaining how you arrived at a conclusion in detail. (e.g. Which document and section it was extracted from)

  If the query is not possible given the provided information, list what information is required to answer the query.
  `;

export const GEN_OUTPUT_PROMPT = (
  dataPrompt: string,
  query: string
): string => {
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
        "statementSource": "Balance sheets"
        "date": "2019-12-31 to 2020-12-31"
      }
    ]
  }
  `;
};
