export const GEN_TICKER_EXTRACTION_PROMPT = (query: string) => {
  return `
  Based on the query below, extract the most relevant public company and its corresponding ticker symbol. If there are multiple companies listed, extract the most relevant one. If none are listed in the query, return an empty JSON (e.g. {})

  Query: "${query}"

  Return the data in the following JSON format:
  ${RETURN_TYPE}
  `;
};

const RETURN_TYPE = `
{
  "company": string // e.g. "Zoom Video Communications, Inc."
  "ticker": string // e.g. "ZM"
}
`;
