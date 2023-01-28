import { ExtractedValue } from './ExtractedValue';
import { Formula } from './FormulaType';

export type ResolvedEntity =
  | { type: 'value'; value: ExtractedValue }
  | { type: 'formula'; formula: Formula };
