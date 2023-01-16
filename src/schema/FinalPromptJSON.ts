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
};
