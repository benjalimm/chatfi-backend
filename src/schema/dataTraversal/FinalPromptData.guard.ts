/*
 * Generated type guards for "FinalPromptData.ts".
 * WARNING: Do not manually change this file.
 */
import { FinalOutputData, Value } from './FinalPromptData';

export function isFinalOutputData(obj: unknown): obj is FinalOutputData {
  const typedObj = obj as FinalOutputData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['answer'] === 'string' &&
    Array.isArray(typedObj['values']) &&
    typedObj['values'].every((e: any) => isValue(e) as boolean)
  );
}

export function isValue(obj: unknown): obj is Value {
  const typedObj = obj as Value;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['key'] === 'string' &&
    typeof typedObj['value'] === 'string' &&
    typeof typedObj['unit'] === 'string' &&
    typeof typedObj['title'] === 'string' &&
    typeof typedObj['statementSource'] === 'string' &&
    typeof typedObj['sectionSource'] === 'string' &&
    typeof typedObj['filingId'] === 'string' &&
    (typedObj['multiplier'] === 'NONE' ||
      typedObj['multiplier'] === 'IN_THOUSANDS' ||
      typedObj['multiplier'] === 'IN_MILLIONS') &&
    (typedObj['valueType'] === 'REFERENCED' ||
      typedObj['valueType'] === 'COMPUTED')
  );
}
