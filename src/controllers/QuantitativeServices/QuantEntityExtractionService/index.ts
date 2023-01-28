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

    // 3. Split resolved entities into extracted values and formulas
    const formulas: Formula[] = [];
    const extractedValues: ExtractedValue[] = [];

    for (const resolvedEntity of resolvedEntities) {
      if (resolvedEntity.type === 'formula') {
        formulas.push(resolvedEntity.formula);
      } else {
        extractedValues.push(resolvedEntity.value);
      }
    }

    // 4. If there are formulas, extract entities from formulas

    // TODO: Add recursive entity extraction from formulas. We only go one level deep for simplicity
    if (formulas.length > 0) {
      const entitiesFromFormulas = await this.extractEntitiesFromFormulas(
        formulas.map((f) => f.formula)
      );
      return this.entityMatchingService.matchEntities([
        ...entities,
        ...entitiesFromFormulas
      ]);
    }
    return resolvedEntities;
  }

  async extractEntitiesFromFormulas(formulas: string[]): Promise<string[]> {
    const PROMPT = GEN_ENTITY_EXTRACTION_FROM_FORMULAS_PROMPT(formulas);
    const response = await this.llmController.executePrompt(PROMPT);
    const json = extractJSONFromString(response) as { entities: string[] };
    return json.entities;
  }
}
