/*
 * Generated type guards for "Metadata.ts".
 * WARNING: Do not manually change this file.
 */
import { DocumentMetadata, StatementMetadata } from './Metadata';

export function isDocumentMetadata(obj: unknown): obj is DocumentMetadata {
  const typedObj = obj as DocumentMetadata;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Array.isArray(typedObj['statements']) &&
    typedObj['statements'].every((e: any) => typeof e === 'string')
  );
}

export function isStatementMetadata(obj: unknown): obj is StatementMetadata {
  const typedObj = obj as StatementMetadata;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Array.isArray(typedObj['segments']) &&
    typedObj['segments'].every((e: any) => typeof e === 'string')
  );
}
