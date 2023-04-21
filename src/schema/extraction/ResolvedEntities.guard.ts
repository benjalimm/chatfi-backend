/*
 * Generated type guards for "ResolvedEntities.ts".
 * WARNING: Do not manually change this file.
 */
import { isFirstOrderValue } from './FirstOrderValue.guard';
import { isFormula } from './FormulaType.guard';
import { ResolvedEntity } from './ResolvedEntities';

export function isResolvedEntity(obj: unknown): obj is ResolvedEntity {
  const typedObj = obj as ResolvedEntity;
  return (
    (((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
      typedObj['type'] === 'value' &&
      (isFirstOrderValue(typedObj['entity']) as boolean)) ||
    (((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
      typedObj['type'] === 'formula' &&
      (isFormula(typedObj['entity']) as boolean))
  );
}
