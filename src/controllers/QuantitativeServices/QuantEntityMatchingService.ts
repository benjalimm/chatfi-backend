import { FirstOrderValue } from '../../schema/FirstOrderValue';
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

    // For each entity, attempt to match entity with value or formula.
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
          console.log(`No matches for entity "${entity}"`);
          continue;
        }
      }
      // 3. Split resolved entities formulas
      const formulas: Formula[] = [];

      for (const resolvedEntity of resolvedEntities) {
        if (resolvedEntity.type === 'formula') {
          formulas.push(resolvedEntity.entity);
        }
      }

      // 4. If there are formulas, recursively extract entities from formulas until we arrive at every first order value
      if (formulas.length > 0) {
        // 4.1 Check if first order values have been previously resolved
        const flattenedEntitiesFromFormulas = formulas.flatMap(
          (f) => f.properties
        );

        // Filter out duplicates
        const entitiesFromFormulas = flattenedEntitiesFromFormulas.filter(
          (item, index) => flattenedEntitiesFromFormulas.indexOf(item) === index
        );

        // Take into consideration previously resolved entities
        if (previouslyResolvedEntities) {
          resolvedEntities.push(...previouslyResolvedEntities);
        }

        // Filter out entities that have not yet been extracted (to avoid duplicates)
        const entitiesNotYetExtracted = entitiesFromFormulas.filter(
          (e) =>
            !resolvedEntities?.find((r) => {
              return ss.compareTwoStrings(e, r.entity.name) >= 0.95;
            })
        );

        if (entitiesNotYetExtracted.length > 0) {
          const re = this.matchEntities(
            entitiesNotYetExtracted,
            resolvedEntities
          );
          resolvedEntities.push(...re);
        }
      }
    }

    // Remove duplicates
    const filteredResolvedEntities = resolvedEntities.filter(
      (item, index, self) => {
        return (
          self.findIndex((obj) => obj.entity.name === item.entity.name) ===
          index
        );
      }
    );
    return filteredResolvedEntities;
  }
}
