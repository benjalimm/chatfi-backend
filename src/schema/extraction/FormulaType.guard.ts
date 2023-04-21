/*
 * Generated type guards for "FormulaType.ts".
 * WARNING: Do not manually change this file.
 */
import { Formula } from './FormulaType';

export function isFormula(obj: unknown): obj is Formula {
  const typedObj = obj as Formula;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    Array.isArray(typedObj['synonyms']) &&
    typedObj['synonyms'].every((e: any) => typeof e === 'string') &&
    typeof typedObj['formula'] === 'string' &&
    Array.isArray(typedObj['properties']) &&
    typedObj['properties'].every((e: any) => typeof e === 'string')
  );
}
