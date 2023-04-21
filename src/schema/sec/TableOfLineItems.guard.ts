/*
 * Generated type guards for "TableOfLineItems.ts".
 * WARNING: Do not manually change this file.
 */
import {
  LineItem,
  InstantPeriod,
  RangePeriod,
  Period,
  TableOfLineItems,
  ArrayOfLineItems
} from './TableOfLineItems';

export function isLineItem(obj: unknown): obj is LineItem {
  const typedObj = obj as LineItem;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['decimals'] === 'string' &&
    typeof typedObj['unitRef'] === 'string' &&
    (typeof typedObj['segment'] === 'undefined' ||
      (((typedObj['segment'] !== null &&
        typeof typedObj['segment'] === 'object') ||
        typeof typedObj['segment'] === 'function') &&
        typeof typedObj['segment']['dimension'] === 'string' &&
        typeof typedObj['segment']['value'] === 'string')) &&
    (isPeriod(typedObj['period']) as boolean) &&
    typeof typedObj['value'] === 'string'
  );
}

export function isInstantPeriod(obj: unknown): obj is InstantPeriod {
  const typedObj = obj as InstantPeriod;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['instant'] === 'string'
  );
}

export function isRangePeriod(obj: unknown): obj is RangePeriod {
  const typedObj = obj as RangePeriod;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['startDate'] === 'string' &&
    typeof typedObj['endDate'] === 'string'
  );
}

export function isPeriod(obj: unknown): obj is Period {
  const typedObj = obj as Period;
  return (
    (isInstantPeriod(typedObj) as boolean) ||
    (isRangePeriod(typedObj) as boolean)
  );
}

export function isTableOfLineItems(obj: unknown): obj is TableOfLineItems {
  const typedObj = obj as TableOfLineItems;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    Object.entries<any>(typedObj).every(
      ([key, value]) =>
        ((isLineItem(value) as boolean) ||
          (Array.isArray(value) &&
            value.every((e: any) => isLineItem(e) as boolean))) &&
        typeof key === 'string'
    )
  );
}

export function isArrayOfLineItems(obj: unknown): obj is ArrayOfLineItems {
  const typedObj = obj as ArrayOfLineItems;
  return (
    Array.isArray(typedObj) &&
    typedObj.every((e: any) => isLineItem(e) as boolean)
  );
}
