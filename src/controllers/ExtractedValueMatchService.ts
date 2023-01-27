import { ExtractedValue } from '../schema/ExtractedValue';
import * as ss from 'string-similarity';
export default class ExtractedValueMatchService {
  private matchThreshold = 0.95;
  private extractedValues: ExtractedValue[] = [];

  matchPropertyWithValue(propertyName: string): ExtractedValue | null {
    const matches: { value: ExtractedValue; similarity: number }[] = [];

    // Find properties with similarity over threshold;
    this.extractedValues.forEach((value) => {
      const similarity = ss.compareTwoStrings(value.name, propertyName);
      if (similarity >= this.matchThreshold) {
        matches.push({ value, similarity });
      }
    });

    if (matches.length === 0) return null;

    // Get highest value
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches[0].value;
  }

  matchPropertiesWithValues(properties: string[]): (ExtractedValue | null)[] {
    const matches: (ExtractedValue | null)[] = [];
    properties.forEach((property) => {
      const match = this.matchPropertyWithValue(property);
      matches.push(match);
    });
    return matches;
  }
}
