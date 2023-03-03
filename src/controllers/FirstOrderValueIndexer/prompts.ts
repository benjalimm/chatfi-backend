import { FOVExtractionInstruction } from '../../schema/FirstOrderValue';

export const GEN_FOV_EXTRACTION_PROMPT = (
  instruction: FOVExtractionInstruction,
  data: string
): string => {
  return `
  DATA:
  ${JSON.stringify(data)}

  Above is some data from a financial statement. Our aim is to extract and structure the value named ${
    instruction.name
  }. ${
    instruction.synonyms.length > 0
      ? `Other names for it could be ${instruction.synonyms.join(',')}`
      : ``
  }.
  If extracting the data is not possible, return success as false.
  Output the data in the following JSON format:
  ${
    instruction.periodType === 'INSTANT'
      ? INSTANT_OUTPUT_JSON
      : RANGE_OUTPUT_JSON
  }  
  `;
};
const INSTANT_OUTPUT_JSON = `
"success": boolean; // true if extraction was successful
"values": { 
  "value": number; // e.g. 1000
  "unit": string;  // e.g. $ or %
  "date": string;  // e.g. 2022-09-30
}[]
`;

const RANGE_OUTPUT_JSON = `
"success": boolean; // true if extraction was successful
"values": { 
  "value": number; // e.g. 1000
  "unit": string;  // e.g. $ or %
  "startDate": string;  // e.g. 2022-01-01
  "endDate": string;  // e.g. 2022-09-30
}[]`;

export const GEN_FOV_SEGMENT_EXTRACTION_PROMPT = (
  instruction: FOVExtractionInstruction,
  segments: string[]
) => {
  return `
  Segments: [${segments}]

  Listed above are segments in the ${
    instruction.statement
  } financial statement. Our aim is to find out the value ${
    instruction.name
  }. ${
    instruction.synonyms.length > 0
      ? `Other names for it could be ${instruction.synonyms.join(',')}`
      : ``
  }.

  In order to find out the value, which segment would you look at if you could only pick one? Make sure not to augment the string when outputting the answer. Output the answer in the following JSON format:
  ${SEGMENT_OUTPUT_JSON}
  `;
};

const SEGMENT_OUTPUT_JSON = `
{ "segment": string // e.g. "Revenues.json" }
`;
