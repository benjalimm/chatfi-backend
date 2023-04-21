/*
 * Generated type guards for "FilingData.ts".
 * WARNING: Do not manually change this file.
 */
import {
  ProcessedStatementsKeyValueStore,
  ProcessedFilingData,
  ProcessedSectionsKeyValueStore,
  ProcessedStatementData,
  ProcessedTextSectionData,
  ProcessedLineItemSectionData,
  ProcessedSectionData
} from './FilingData';

export function isProcessedStatementsKeyValueStore(
  obj: unknown
): obj is ProcessedStatementsKeyValueStore {
  const typedObj = obj as ProcessedStatementsKeyValueStore;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Object.entries<any>(typedObj).every(
      ([key, value]) =>
        (isProcessedStatementData(value) as boolean) && typeof key === 'string'
    )
  );
}

export function isProcessedFilingData(
  obj: unknown
): obj is ProcessedFilingData {
  const typedObj = obj as ProcessedFilingData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['id'] === 'string' &&
    Array.isArray(typedObj['listOfStatements']) &&
    typedObj['listOfStatements'].every((e: any) => typeof e === 'string') &&
    (isProcessedStatementsKeyValueStore(typedObj['statements']) as boolean)
  );
}

export function isProcessedSectionsKeyValueStore(
  obj: unknown
): obj is ProcessedSectionsKeyValueStore {
  const typedObj = obj as ProcessedSectionsKeyValueStore;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Object.entries<any>(typedObj).every(
      ([key, value]) =>
        (isProcessedSectionData(value) as boolean) && typeof key === 'string'
    )
  );
}

export function isProcessedStatementData(
  obj: unknown
): obj is ProcessedStatementData {
  const typedObj = obj as ProcessedStatementData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['name'] === 'string' &&
    Array.isArray(typedObj['listOfSections']) &&
    typedObj['listOfSections'].every((e: any) => typeof e === 'string') &&
    (isProcessedSectionsKeyValueStore(typedObj['sections']) as boolean)
  );
}

export function isProcessedTextSectionData(
  obj: unknown
): obj is ProcessedTextSectionData {
  const typedObj = obj as ProcessedTextSectionData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typedObj['fileType'] === 'html' &&
    typeof typedObj['htmlData'] === 'string'
  );
}

export function isProcessedLineItemSectionData(
  obj: unknown
): obj is ProcessedLineItemSectionData {
  const typedObj = obj as ProcessedLineItemSectionData;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typedObj['fileType'] === 'json' &&
    typeof typedObj['jsonData'] === 'string'
  );
}

export function isProcessedSectionData(
  obj: unknown
): obj is ProcessedSectionData {
  const typedObj = obj as ProcessedSectionData;
  return (
    (isProcessedTextSectionData(typedObj) as boolean) ||
    (isProcessedLineItemSectionData(typedObj) as boolean)
  );
}
