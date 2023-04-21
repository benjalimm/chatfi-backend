/*
 * Generated type guards for "SECApiTypes.ts".
 * WARNING: Do not manually change this file.
 */
import {
  SECFiling,
  SECEntity,
  DocumentFormatFile,
  FilingResponse
} from './SECApiTypes';

export function isSECFiling(obj: unknown): obj is SECFiling {
  const typedObj = obj as SECFiling;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['id'] === 'string' &&
    typeof typedObj['accessionNo'] === 'string' &&
    typeof typedObj['cik'] === 'string' &&
    typeof typedObj['ticker'] === 'string' &&
    typeof typedObj['companyName'] === 'string' &&
    typeof typedObj['companyNameLong'] === 'string' &&
    typeof typedObj['formType'] === 'string' &&
    typeof typedObj['description'] === 'string' &&
    typeof typedObj['filedAt'] === 'string' &&
    typeof typedObj['linkToTxt'] === 'string' &&
    typeof typedObj['linkToHtml'] === 'string' &&
    typeof typedObj['linkToXbrl'] === 'string' &&
    typeof typedObj['linkToFilingDetails'] === 'string' &&
    Array.isArray(typedObj['entities']) &&
    typedObj['entities'].every((e: any) => isSECEntity(e) as boolean) &&
    Array.isArray(typedObj['documentFormatFiles']) &&
    typedObj['documentFormatFiles'].every(
      (e: any) => isDocumentFormatFile(e) as boolean
    )
  );
}

export function isSECEntity(obj: unknown): obj is SECEntity {
  const typedObj = obj as SECEntity;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['companyName'] === 'string' &&
    typeof typedObj['cik'] === 'string' &&
    typeof typedObj['irsNo'] === 'string' &&
    typeof typedObj['stateOfIncorporation'] === 'string' &&
    typeof typedObj['fiscalYearEnd'] === 'string' &&
    typeof typedObj['type'] === 'string' &&
    typeof typedObj['act'] === 'string' &&
    typeof typedObj['fileNo'] === 'string' &&
    typeof typedObj['filmNo'] === 'string' &&
    typeof typedObj['sic'] === 'string'
  );
}

export function isDocumentFormatFile(obj: unknown): obj is DocumentFormatFile {
  const typedObj = obj as DocumentFormatFile;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['sequence'] === 'string' &&
    typeof typedObj['description'] === 'string' &&
    typeof typedObj['documentUrl'] === 'string' &&
    typeof typedObj['type'] === 'string' &&
    typeof typedObj['size'] === 'string'
  );
}

export function isFilingResponse(obj: unknown): obj is FilingResponse {
  const typedObj = obj as FilingResponse;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    ((typedObj['total'] !== null && typeof typedObj['total'] === 'object') ||
      typeof typedObj['total'] === 'function') &&
    typeof typedObj['total']['value'] === 'number' &&
    typeof typedObj['total']['relation'] === 'string' &&
    ((typedObj['query'] !== null && typeof typedObj['query'] === 'object') ||
      typeof typedObj['query'] === 'function') &&
    typeof typedObj['query']['from'] === 'number' &&
    typeof typedObj['query']['size'] === 'number' &&
    Array.isArray(typedObj['filings']) &&
    typedObj['filings'].every((e: any) => isSECFiling(e) as boolean)
  );
}
