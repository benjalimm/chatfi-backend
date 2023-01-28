import { ExtractedValue } from '../../schema/ExtractedValue';
import { Formula } from '../../schema/FormulaType';
import { ResolvedEntity } from '../../schema/ResolvedEntities';
import ExtractedValueMatchService from './ExtractedValueMatchService';
import FormulaMatchService from './FormulaMatchService';

export default class QuantEntityMatchingService {
  private formulaMatchService: FormulaMatchService;
  private extractedValueMatchService: ExtractedValueMatchService;

  constructor() {
    this.formulaMatchService = new FormulaMatchService();
    this.extractedValueMatchService = new ExtractedValueMatchService();
  }
  matchEntities(entities: string[]): ResolvedEntity[] {
    const resolvedEntities: ResolvedEntity[] = [];
    for (const entity of entities) {
      // 1. Attempt to match with extracted value
      const value =
        this.extractedValueMatchService.matchEntityWithValue(entity);

      if (value) {
        resolvedEntities.push({ type: 'value', value });
        continue;
      } else {
        const formula = this.formulaMatchService.matchEntityWithFormula(entity);
        if (formula) {
          resolvedEntities.push({ type: 'formula', formula });

          // 2. Match entities required
        } else {
          // TODO: Find value instead of throwing error
          /// This is temp to keep things simple
          throw new Error(`No matches for entity "${entity}"`);
        }
      }
    }
    return resolvedEntities;
  }
}
