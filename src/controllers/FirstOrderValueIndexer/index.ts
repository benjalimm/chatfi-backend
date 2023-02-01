import LLMController from '../../schema/controllers/LLMController';
import {
  FirstOrderValue,
  FOVExtractionInstruction,
  InstantValue,
  RangeValue
} from '../../schema/FirstOrderValue';
import { DocumentMetadata, StatementMetadata } from '../../schema/Metadata';
import {
  extractJSONFromString,
  readJSON,
  writeData
} from '../DataTraversalControllers/Utils';
import * as ss from 'string-similarity';
import {
  GEN_FOV_EXTRACTION_PROMPT,
  GEN_FOV_SEGMENT_EXTRACTION_PROMPT
} from './prompts';

export default class FirstOrderValueIndexer {
  private dataFilePath: string;
  private outputPath: string;
  private instructions: FOVExtractionInstruction[];
  private llmController: LLMController;

  private documentMetadata(): DocumentMetadata {
    return readJSON(`${this.dataFilePath}/metadata.json`) as DocumentMetadata;
  }

  constructor(
    dataFilePath: string,
    outputPath: string,
    instructions: FOVExtractionInstruction[],
    llmController: LLMController
  ) {
    this.dataFilePath = dataFilePath;
    this.instructions = instructions;
    this.llmController = llmController;
    this.outputPath = `../../../extractions/firstOrderValues.json`;
  }

  async beginIndexing() {
    let { data } = readJSON(this.outputPath) as { data: FirstOrderValue[] };
    if (!data) {
      data = [];
    }
    for (const instruction of this.instructions) {
      try {
        const values = await this.extractValueWithInstruction(instruction);
        this.persistValues(instruction, values);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async extractValueWithInstruction(
    instruction: FOVExtractionInstruction
  ): Promise<InstantValue[] | RangeValue[]> {
    // 1. Find statement using string similarity
    const statements = this.documentMetadata().statements;
    const statement = this.findBestMatch(instruction.statement, statements);

    // 2. Narrow down sections using string similarity
    const statementMetadata = readJSON(
      `${this.dataFilePath}/${statement}/metadata.json`
    ) as StatementMetadata;
    const segments = statementMetadata.segments;
    const segment = await this.extractRelevantSegment(instruction, segments);
    const data = readJSON(`${this.dataFilePath}/${statement}/${segment}`);

    // 3. Extract value using LLM, ask it to format it in
    const PROMPT = GEN_FOV_EXTRACTION_PROMPT(instruction, data);
    const response = await this.llmController.executePrompt(PROMPT);

    const extractionResponse = extractJSONFromString(response) as
      | {
          success: boolean;
          values: InstantValue[];
        }
      | {
          success: boolean;
          values: RangeValue[];
        };
    if (!extractionResponse.success) {
      throw new Error(`Failed to parse ${instruction.name}`);
    }
    return extractionResponse.values;
  }

  private findBestMatch(input: string, potentialMatches: string[]): string {
    const similarities = ss.findBestMatch(input, potentialMatches);
    const bestMatch = similarities.bestMatch;
    return bestMatch.target;
  }

  private async extractRelevantSegment(
    instruction: FOVExtractionInstruction,
    segments: string[]
  ): Promise<string> {
    const PROMPT = GEN_FOV_SEGMENT_EXTRACTION_PROMPT(instruction, segments);

    const response = await this.llmController.executePrompt(PROMPT);
    const { segment } = extractJSONFromString(response) as {
      segment: string;
    };
    return segment;
  }

  private findMostSimilarSegments(
    instruction: FOVExtractionInstruction,
    segments: string[]
  ): string[] {
    const matches: string[] = [];
    const inputs = [instruction.name, ...instruction.synonyms];

    for (const input of inputs) {
      segments.forEach((seg) => {
        if (ss.compareTwoStrings(seg, input) >= 0.7) {
          if (!matches.includes(seg)) {
            matches.push(seg);
          }
        }
      });
    }
    return matches;
  }

  private persistValues(
    instruction: FOVExtractionInstruction,
    values: InstantValue[] | RangeValue[]
  ) {
    // 1. Read existing data
    let { data } = readJSON(this.outputPath) as { data: FirstOrderValue[] };
    if (!data) {
      data = [];
    }

    const fov: FirstOrderValue =
      instruction.periodType === 'INSTANT'
        ? {
            name: instruction.name,
            type: 'INSTANT',
            values: values as InstantValue[]
          }
        : {
            name: instruction.name,
            type: 'RANGE',
            values: values as RangeValue[]
          };
    data.push(fov);
    writeData(this.outputPath, JSON.stringify({ data }));
  }
}
