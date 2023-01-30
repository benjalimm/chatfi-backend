import LLMController from '../../../schema/controllers/LLMController';
import { ExtractedValue } from '../../../schema/ExtractedValue';
import { Formula } from '../../../schema/FormulaType';
import { ResolvedEntity } from '../../../schema/ResolvedEntities';
import { extractJSONFromString } from '../../DataTraversalControllers/Utils';
import QuantEntityMatchingService from '../QuantEntityMatchingService';
import {
  GEN_ENTITY_EXTRACTION_FROM_FORMULAS_PROMPT,
  GEN_ENTITY_EXTRACTION_FROM_QUERY_PROMPT
} from './prompts';

export default class QuantEntityExtractionService {
  private llmController: LLMController;
  private entityMatchingService: QuantEntityMatchingService;
  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.entityMatchingService = new QuantEntityMatchingService();
  }

  async extractEntitiesFromQuery(query: string): Promise<ResolvedEntity[]> {
    // 1. Extract entities from string;
    const PROMPT = GEN_ENTITY_EXTRACTION_FROM_QUERY_PROMPT(query);
    const response = await this.llmController.executePrompt(PROMPT);
    const { entities } = extractJSONFromString(response) as {
      entities: string[];
    };

    if (entities.length === 0) throw new Error('No entities found');

    //2.  Attempt to match entities
    const resolvedEntities = this.entityMatchingService.matchEntities(entities);

    return resolvedEntities;
  }

  async extractEntitiesFromFormulas(formulas: string[]): Promise<string[]> {
    const PROMPT = GEN_ENTITY_EXTRACTION_FROM_FORMULAS_PROMPT(formulas);
    const response = await this.llmController.executePrompt(PROMPT);
    const json = extractJSONFromString(response) as { entities: string[] };
    return json.entities;
  }
}
