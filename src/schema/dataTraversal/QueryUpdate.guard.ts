/*
 * Generated type guards for "QueryUpdate.ts".
 * WARNING: Do not manually change this file.
 */
import { QueryUpdate } from './QueryUpdate';

export function isQueryUpdate(obj: unknown): obj is QueryUpdate {
  const typedObj = obj as QueryUpdate;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    (typedObj['type'] === 'STATEMENT' ||
      typedObj['type'] === 'SECTION' ||
      typedObj['type'] === 'FINAL') &&
    typeof typedObj['name'] === 'string'
  );
}
