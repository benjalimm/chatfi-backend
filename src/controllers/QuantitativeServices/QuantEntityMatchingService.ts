import { ExtractedValue } from '../../schema/ExtractedValue';
import { Formula } from '../../schema/FormulaType';
import { ResolvedEntity } from '../../schema/ResolvedEntities';
import ExtractedValueMatchService from './ExtractedValueMatchService';
import FormulaMatchService from './FormulaMatchService';
import * as ss from 'string-similarity';

export default class QuantEntityMatchingService {
  private formulaMatchService: FormulaMatchService;
  private extractedValueMatchService: ExtractedValueMatchService;

  constructor() {
    this.formulaMatchService = new FormulaMatchService();
    this.extractedValueMatchService = new ExtractedValueMatchService();
  }
  matchEntities(
    entities: string[],
    previouslyResolvedEntities?: ResolvedEntity[]
  ): ResolvedEntity[] {
    const resolvedEntities: ResolvedEntity[] = [];
    for (const entity of entities) {
      // 1. Attempt to match with extracted value
      const value =
        this.extractedValueMatchService.matchEntityWithValue(entity);

      if (value) {
        resolvedEntities.push({ type: 'value', entity: value });
        continue;
      } else {
        const formula = this.formulaMatchService.matchEntityWithFormula(entity);
        if (formula) {
          resolvedEntities.push({ type: 'formula', entity: formula });

          // 2. Match entities required
        } else {
          // TODO: Find value instead of throwing error
          /// This is temp to keep things simple
          throw new Error(`No matches for entity "${entity}"`);
        }
      }
      // 3. Split resolved entities formulas
      const formulas: Formula[] = [];

      for (const resolvedEntity of resolvedEntities) {
        if (resolvedEntity.type === 'formula') {
          formulas.push(resolvedEntity.entity);
        }
      }

      // 4. If there are formulas, extract entities from formulas

      // TODO: Add recursive entity extraction from formulas. We only go one level deep for simplicity
      if (formulas.length > 0) {
        // 5. If there are formulas, we need to ensure that all the first order values have been resolved.

        // 5.1 Check if first order values have been previously resolved
        const entitiesFromFormulas = formulas.flatMap((f) => f.properties);

        // Take into consideration previously resolved entities
        if (previouslyResolvedEntities) {
          resolvedEntities.push(...previouslyResolvedEntities);
        }

        const entitiesNotYetExtracted = entitiesFromFormulas.filter(
          (e) =>
            !resolvedEntities?.find((r) => {
              return ss.compareTwoStrings(e, r.entity.name) >= 0.95;
            })
        );

        if (entitiesNotYetExtracted.length > 0) {
          return this.matchEntities(entitiesNotYetExtracted, resolvedEntities);
        }
        return resolvedEntities;
      }
    }
    return resolvedEntities;
  }
}
