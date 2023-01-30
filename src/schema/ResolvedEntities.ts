import { ExtractedValue } from './ExtractedValue';
import { Formula } from './FormulaType';

export type ResolvedEntity =
  | { type: 'value'; entity: ExtractedValue }
  | { type: 'formula'; entity: Formula };
