/*
 * Generated type guards for "ExtractedData.ts".
 * WARNING: Do not manually change this file.
 */
import { ExtractedData } from './ExtractedData';

export function isExtractedData(obj: unknown): obj is ExtractedData {
  const typedObj = obj as ExtractedData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['filingId'] === 'string' &&
    typeof typedObj['statementSource'] === 'string' &&
    typeof typedObj['sectionSource'] === 'string' &&
    typeof typedObj['data'] === 'string'
  );
}
