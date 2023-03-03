import { FirstOrderValue } from '../../schema/FirstOrderValue.js';
import * as ss from 'string-similarity';
import { readJSON } from '../DataTraversalControllers/Utils.js';
export default class ExtractedValueMatchService {
  private matchThreshold = 0.95;
  private extractedValues: FirstOrderValue[];

  constructor() {
    const { data } = readJSON('../../../extractions/firstOrderValues.json') as {
      data: FirstOrderValue[];
    };
    this.extractedValues = data;
  }

  matchEntityWithValue(entityName: string): FirstOrderValue | null {
    const matches: { value: FirstOrderValue; similarity: number }[] = [];

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

  matchEntitiesWithValues(entities: string[]): (FirstOrderValue | null)[] {
    const matches: (FirstOrderValue | null)[] = [];
    entities.forEach((entity) => {
      const match = this.matchEntityWithValue(entity);
      matches.push(match);
    });
    return matches;
  }
}
