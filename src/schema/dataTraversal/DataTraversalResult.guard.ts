/*
 * Generated type guards for "DataTraversalResult.ts".
 * WARNING: Do not manually change this file.
 */
import { isExtractedData } from './ExtractedData.guard';
import { DataTraversalResult } from './DataTraversalResult';

export function isDataTraversalResult(
  obj: unknown
): obj is DataTraversalResult {
  const typedObj = obj as DataTraversalResult;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Array.isArray(typedObj['listOfExtractedData']) &&
    typedObj['listOfExtractedData'].every(
      (e: any) => isExtractedData(e) as boolean
    )
  );
}
