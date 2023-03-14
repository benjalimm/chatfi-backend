export const GEN_ENTITY_EXTRACTION_FROM_QUERY_PROMPT = (query: string) => {
  return `
  The following query is a user asking question about some financial reports ("${query}"), extract any entities from the query above that represent financial entities you would find or calculate in financial statements (e.g. Quick ratio, net income, current assets, taxes). Output them in a single JSON with the following structure:
  ${OUTPUT_JSON}
  Examples: "Calculate the quick ratio" -> Entities: ["quick ratio"]
  `;
};

export const GEN_ENTITY_EXTRACTION_FROM_FORMULAS_PROMPT = (
  formulas: string[]
) => {
  return `
  Formulas: ${formulas.map((formula) => formula + '\n')}

  For the formulas listed above, extract all entities after the equal sign from the formulas and output them in the following JSON. Do not repeat them in the output. Output them in the following JSON:
  ${OUTPUT_JSON}
  Example: "Net income = Revenue - Expenses" -> Entities: ["Revenue", "Expenses"]
  `;
};

const OUTPUT_JSON = `
 { 
    "entities": string[] // e.g. ["Current assets", "Current liabilities", "Change in working capital"]
 }

`;
