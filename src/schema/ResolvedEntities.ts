import { FirstOrderValue } from './FirstOrderValue.js';
import { Formula } from './FormulaType.js';

export type ResolvedEntity =
  | { type: 'value'; entity: FirstOrderValue }
  | { type: 'formula'; entity: Formula };
