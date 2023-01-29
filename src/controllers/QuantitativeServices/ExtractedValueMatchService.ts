import { ExtractedValue } from '../../schema/ExtractedValue';
import * as ss from 'string-similarity';
export default class ExtractedValueMatchService {
  private matchThreshold = 0.95;
  private extractedValues: ExtractedValue[] = [
    {
      name: 'Current asset',
      type: 'INSTANT',
      values: [{ value: 1000000, unit: '$', date: '2022-09-30' }]
    },
    {
      name: 'Current liabilities',
      type: 'INSTANT',
      values: [{ value: 500000, unit: '$', date: '2022-09-30' }]
    },
    {
      name: 'Inventory',
      type: 'INSTANT',
      values: [{ value: 200000, unit: '$', date: '2022-09-30' }]
    }
  ];

  matchEntityWithValue(entityName: string): ExtractedValue | null {
    const matches: { value: ExtractedValue; similarity: number }[] = [];

    // Find properties with similarity over threshold;
    this.extractedValues.forEach((value) => {
      const similarity = ss.compareTwoStrings(value.name, entityName);
      if (similarity >= this.matchThreshold) {
        matches.push({ value, similarity });
      }
    });

    if (matches.length === 0) return null;

    // Get highest value
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches[0].value;
  }

  matchEntitiesWithValues(entities: string[]): (ExtractedValue | null)[] {
    const matches: (ExtractedValue | null)[] = [];
    entities.forEach((entity) => {
      const match = this.matchEntityWithValue(entity);
      matches.push(match);
    });
    return matches;
  }
}
