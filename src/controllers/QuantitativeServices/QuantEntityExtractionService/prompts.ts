export const GEN_ENTITY_EXTRACTION_FROM_QUERY_PROMPT = (query: string) => {
  return `
  For the following query ("${query}"), extract any quantitative entities and output them in the following JSON:
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
    "entities": ["Current assets", "Current liabilities"]
 }

`;
