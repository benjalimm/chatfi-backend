/*
 * Generated type guards for "ExtractedStatementsResponse.ts".
 * WARNING: Do not manually change this file.
 */
import ExtractedStatementsReponse from './ExtractedStatementsResponse';

export function isExtractedStatementsReponse(
  obj: unknown
): obj is ExtractedStatementsReponse {
  const typedObj = obj as ExtractedStatementsReponse;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Array.isArray(typedObj['statements']) &&
    typedObj['statements'].every((e: any) => typeof e === 'string')
  );
}
