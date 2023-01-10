/**
 * Generate a prompt to get LLM to select pertinent statements based on the query
 * @param maxStatements Max no. of statements it should look at
 * @param statements List of statements
 * @param query Original query
 * @returns A string with JSON of type { statements: string [] } imbued in it.
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
 * Generate a prompt to get LLM to select pertinent segments based on the query
 * @param maxSegments Max amount of segements it should look at
 * @param segments List of segments
 * @param query The original query
 * @returns A string with JSON of type { segments: string [] } imbued in it.
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
