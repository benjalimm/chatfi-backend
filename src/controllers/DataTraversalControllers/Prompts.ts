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
  List of statements: [${statements}]\n
    Above are the financial statements that are available for a given company. Which financial statements would you look at if you were to adequately answer the query below? You can only select a maximum of ${maxStatements} statements.
    Format the answers with the following JSON format:
    { "statements": string[] }
    The output array should be ordered from most to least relevant statement. The statement strings should not be altered in any way when outputted. (e.g. Do not capitalize, uncapitalize, add or remove any characters)\n
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
  statement: string,
  segments: string[],
  query: string
) => {
  return `
  [${segments}]\n
  Above are segments from the financial statement ${statement}. Based on the following query, which segments has over an 80% chance of containing data relevant to the query?  You are only allowed to pick a maximum of ${maxSegments} segments and a minimum of 0. Output the exact answer including the file extension with no changes in a JSON with the following schema:
      { "segments": string[] }
      The output array should be ordered from most to least relevant statement. The segment strings should not be altered in any way when outputted. (e.g. Do not capitalize, uncapitalize, add or remove any characters). Only output segments that are listed above and do not invent new ones.\n
      \n Query: ${query}`;
};

/**
 * Generates propmpt to extracts information from JSON segment and outputs pertinent info based on the query
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
  \n Listed above is a JSON for the segment ${segment}. Based on the following query, extract the relevant data from the data listed above and output the data in a structured JSON.
  \n Query: ${query}
  `;
};

/**
 * Generate prompt to extract information from txt segment and outputs pertinent info based on the query
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

/**
 * Generates prompt to rank segments from most to least pertinent based on the query
 * @param listOfSegmentsString List of statement segments in string format (statement/segment)
 * @param query Original query
 * @returns Completed prompt
 */
export const GEN_RANK_SEGMENTS_PROMPT = (
  listOfSegmentsString: string,
  query: string
) => {
  return `List of segments: [${listOfSegmentsString}]\n
  Above is a list of segments from financial statements. Based on the following query, rank the segments from most likely to find the pertinent information to the least likely. Output the exact answer including the file extension with no changes in a JSON with the following schema:
      { "statementSegments": string[] }
      \n Query: ${query}`;
};

export const GEN_EXTRACT_OR_MOVE_ON_PROMPT = (
  extractedDataSoFar: string,
  dataExtractionPrompt: string,
  query: string
) => {
  return `
  INSTRUCTION 1: \n
  ${extractedDataSoFar}\n
  Listed above is some structured data. Based on the query listed below, do we have adequate data to answer the query? If yes, ignore instruction 2 and output the following JSON: { escape: true }. If no, continue to instruction 2.

  INSTRUCTION 2: 
  ${dataExtractionPrompt}

  `;
};
