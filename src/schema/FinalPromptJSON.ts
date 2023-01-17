export interface FinalOutputJSON {
  explanation: string;
  values: Value[];
}

export type Value = {
  key: string;
  value: number;
  unit: string;
  title: string;
  statementSource: string;
  date: string;
  multiplier: 'NONE' | 'IN_THOUSANDS' | 'IN_MILLIONS';
};
