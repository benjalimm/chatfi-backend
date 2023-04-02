import { FirstOrderValue } from './FirstOrderValue';
import { Formula } from './FormulaType';

export type ResolvedEntity =
  | { type: 'value'; entity: FirstOrderValue }
  | { type: 'formula'; entity: Formula };
