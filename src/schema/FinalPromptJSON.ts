export interface FinalOutputJSON {
  answer: string;
  values: Value[];
}

export type Value = {
  key: string;
  value: string;
  unit: string;
  title: string;
  statementSource: string;
  sectionSource: string;
  multiplier: 'NONE' | 'IN_THOUSANDS' | 'IN_MILLIONS';
};

export const Value_EXAMPLE: Value = {
  key: 'key',
  value: 'value',
  unit: 'unit',
  title: 'title',
  statementSource: 'statementSource',
  sectionSource: 'sectionSource',
  multiplier: 'NONE'
};

export const FinalOutputJSON_EXAMPLE: FinalOutputJSON = {
  answer: 'answer',
  values: [Value_EXAMPLE]
};
