/*
 * Generated type guards for "FirstOrderValue.ts".
 * WARNING: Do not manually change this file.
 */
import {
  RangeValue,
  InstantValue,
  FirstOrderRangeValues,
  FirstOrderInstantValues,
  FirstOrderValue,
  FOVExtractionInstruction
} from './FirstOrderValue';

export function isRangeValue(obj: unknown): obj is RangeValue {
  const typedObj = obj as RangeValue;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['value'] === 'number' &&
    typeof typedObj['unit'] === 'string' &&
    typeof typedObj['startDate'] === 'string' &&
    typeof typedObj['endDate'] === 'string'
  );
}

export function isInstantValue(obj: unknown): obj is InstantValue {
  const typedObj = obj as InstantValue;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['value'] === 'number' &&
    typeof typedObj['unit'] === 'string' &&
    typeof typedObj['date'] === 'string'
  );
}

export function isFirstOrderRangeValues(
  obj: unknown
): obj is FirstOrderRangeValues {
  const typedObj = obj as FirstOrderRangeValues;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    typedObj['type'] === 'RANGE' &&
    Array.isArray(typedObj['values']) &&
    typedObj['values'].every((e: any) => isRangeValue(e) as boolean)
  );
}

export function isFirstOrderInstantValues(
  obj: unknown
): obj is FirstOrderInstantValues {
  const typedObj = obj as FirstOrderInstantValues;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    typedObj['type'] === 'INSTANT' &&
    Array.isArray(typedObj['values']) &&
    typedObj['values'].every((e: any) => isInstantValue(e) as boolean)
  );
}

export function isFirstOrderValue(obj: unknown): obj is FirstOrderValue {
  const typedObj = obj as FirstOrderValue;
  return (
    (isFirstOrderRangeValues(typedObj) as boolean) ||
    (isFirstOrderInstantValues(typedObj) as boolean)
  );
}

export function isFOVExtractionInstruction(
  obj: unknown
): obj is FOVExtractionInstruction {
  const typedObj = obj as FOVExtractionInstruction;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    (typedObj['periodType'] === 'RANGE' ||
      typedObj['periodType'] === 'INSTANT') &&
    Array.isArray(typedObj['synonyms']) &&
    typedObj['synonyms'].every((e: any) => typeof e === 'string') &&
    typeof typedObj['statement'] === 'string'
  );
}
