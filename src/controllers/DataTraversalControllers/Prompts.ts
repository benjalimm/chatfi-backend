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
    Above are the financial statements that are available for a given company.  Imagine you are an accountant or a banker. Which of the financial statements listed above would you look at if you were to adequately answer the following query ("${query}")? You can only select a maximum of ${maxStatements} statements.
    Format the answers with the following JSON format:
    { "statements": string[] }
    The output array should be ordered from most to least relevant statement. The statement strings should not be altered in any way when outputted. (e.g. Do not capitalize, uncapitalize, add or remove any characters)
    `;
};

/**
 * Generate a prompt to get the LLM to select pertinent segments based on the query
 * @param maxSegments Max amount of segements it should look at
 * @param statement Statement from which the segments are from
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
  \n Listed above is a JSON for the segment ${segment}. Based on the following query, extract the relevant data from the data listed above and output the data in a structured JSON. Throw away unnecessary data that is not needed. Only extract what you need and no more, do so in the most concise way possible.
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
    \n Listed above is text from the segment ${segment}. It likely contains numbers and text that was copy and pasted straight from a table in a PDF. Based on the following query ("${query}"), extract the relevant data in a structured JSON. Numeric values listed might be in thousands, which means that the number stated is 1/1000th of the actual value. If so, list the multiplier effect in a property called "multiplier". When extracting values, simply extract the string and do not manipulate it at all (e.g. Don't remove commas). DO NOT REPLACE COMMAS WITH FULL STOPS). Throw away unnecessary data that is not needed. Be detailed with dates when labelling data. Here is an example output JSON: 
    { data: Data // Relevant output data here
      multipler: "IN_HUNDREDS" | "IN_THOUSANDS" | "IN_MILLIONS"
    }
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
  Above is a list of segments from financial statements. Imagine you are an accountant or a banker.Based on the following query("${query}"), rank the segments from most likely to find the pertinent information to the least likely. Output the exact answer including the file extension with no changes in a JSON with the following schema:
      { "statementSegments": string[] }`;
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

export const GEN_STANDARD_STATEMENT_EXTRACTION_PROMPT = (
  query: string,
  standardFinancialStatements: string[]
): string => {
  return `${query}
  List of financial statements: [${standardFinancialStatements}]

  Imagine you are an accountant or a banker. Based on the following query("${query}"), what financial statements listed above would you look at in a quarterly report to answer the query. If this query can be answered with the listed statements, return a JSON with an array of relevant statements ordered from most relevant to least relevant.  If additional notes are required to answer the question, return true in a property called "requiresNotes". Output Structure should be:
  { "statements": string [], "requiresNotes": boolean }
  `;
};
