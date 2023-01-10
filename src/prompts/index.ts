export const GET_DOCUMENT_TYPE_PROMPT = `

    Above are the financial statements that are available for company X. Based on the following query, which financial statement should be queried?
    Format the answers with the following JSON format:
    { "documentTypes": string[] }
    Query: 
    `;

export const INFER_ANSWER_PROMPT = ` 
  Above is a potentially a list of segments from financial statements in JSON. Based on the following information, execute the following query. Output the answer in dot points.
  Query: 
  `;

export const PRECAUTIONS_PROMPT = `
  Specify numbers and dates if possible. All dollar amount should start with the $ symbol. Extract exact values and do not alter them (e.g. Make sure not $3,000,000 doesn't turn into $300,000)

  Always explain how you arrived at a conclusion. (e.g. Which document and segment it was extracted from)

  If the query is not possible given the provided information, list what information is required to answer the query.
  `;
