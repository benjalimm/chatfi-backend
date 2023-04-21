/*
 * Generated type guards for "StatementData.ts".
 * WARNING: Do not manually change this file.
 */
import { StatementData } from './StatementData';

export function isStatementData(obj: unknown): obj is StatementData {
  const typedObj = obj as StatementData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['filingId'] === 'string' &&
    typeof typedObj['statement'] === 'string' &&
    (typedObj['type'] === 'LINE_ITEMS' || typedObj['type'] === 'TEXT') &&
    typeof typedObj['data'] === 'string'
  );
}
