/**
 * Generate a prompt to get the LLM to select pertinent statements based on the query
 * @param maxStatements Max no. of statements it should look at
 * @param statements List of statements
 * @param query Original query
 * @returns Completed prompt
 */
export const GEN_STATEMENT_EXTRACTION_PROMPT = (
  maxStatements: number,
  statements: string[],
  query: string
) => {
  return `
  List of statements: [ ${statements}]\n
    Above are the financial statements that are available for company X. Based on the following query, which financial statement should be queried? You can only select a maximum of ${maxStatements} statements.
    Format the answers with the following JSON format:
    { "documentTypes": string[] }
    The output array should be ordered from most important statement to least important statement.
    Query: ${query}
    `;
};

/**
 * Generate a prompt to get the LLM to select pertinent segments based on the query
 * @param maxSegments Max amount of segements it should look at
 * @param segments List of segments
 * @param query The original query
 * @returns Completed prompt
 */
export const GEN_SEGMENT_EXTRACTION_PROMPT = (
  maxSegments: number,
  segments: string[],
  query: string
) => {
  return `
  List of segments:[${segments}.]\n
  Based on the following query, which file segments listed above would you look at? Only list files that are listed above and do not invent new ones. You are only allowed to pick a maximum of ${maxSegments} files. Output the exact answer including the file extension with no changes in a JSON with the following schema:
      { "segments": string[] }
      \n Query: ${query}`;
};

/**
 * Extracts information from JSON segment and outputs pertinent info based on the query
 * @param segment Segment from statement
 * @param stringifiedJSON JSON data from segment
 * @param query Original query
 * @returns Completed prompt
 */
export const GEN_SEGMENT_JSON_DATA_EXTRACTION_PROMPT = (
  segment: string,
  stringifiedJSON: string,
  query: string
) => {
  return `
  ${stringifiedJSON}
  \n Listed above is a JSON for the segment ${segment}. Based on the following query, extract the pertinent data from the data listed above and output the data in a structured JSON.
  \n Query: ${query}
  `;
};

/**
 * Extracts information from txt segment and outputs pertinent info based on the query
 * @param segment Segment from statement
 * @param txtData txt data from segment
 * @param query Original query
 * @returns Completed prompt
 */
export const GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT = (
  segment: string,
  txtData: string,
  query: string
) => {
  return `
    ${txtData}
    \n Listed above is a txt file from the segment ${segment}. It might contain tables that were copy and pasted straight from a pdf file. Based on the following query, extract the pertinent data in a structured JSON
    \n Query: ${query}
    `;
};
