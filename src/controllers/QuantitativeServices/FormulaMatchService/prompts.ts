export const GEN_FORMULA_MATCH_PROMPT = (query: string) => {
  return `
  The following query ("${query}") is a user asking a quantitative question about a financial report. Below is a list of formulas that can be used to answer the question. Output a JSON object with the key "formula" and the value being the formula that best answers the question. Example: \n${OUTPUT_JSON} `;
};

const OUTPUT_JSON = `
{ 
  "formulaKey": "calcQuickRatio"
}

`;
