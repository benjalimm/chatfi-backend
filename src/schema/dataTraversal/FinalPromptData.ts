export interface FinalOutputData {
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
  valueType: 'REFERENCED' | 'COMPUTED';
};

export const Value_EXAMPLE: Value = {
  key: 'key',
  value: 'value',
  unit: 'unit',
  title: 'title',
  statementSource: 'statementSource',
  sectionSource: 'sectionSource',
  multiplier: 'NONE',
  valueType: 'REFERENCED'
};

export const FinalOutputJSON_EXAMPLE: FinalOutputData = {
  answer: 'answer',
  values: [Value_EXAMPLE]
};
