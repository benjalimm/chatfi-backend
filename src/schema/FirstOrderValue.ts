export type RangeValue = {
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
};

export type InstantValue = {
  value: number;
  unit: string;
  date: string;
};

export type FirstOrderRangeValues = {
  name: string;
  type: 'RANGE';
  values: RangeValue[];
};

export type FirstOrderInstantValues = {
  name: string;
  type: 'INSTANT';
  values: InstantValue[];
};

// UNION TYPE
export type FirstOrderValue = FirstOrderRangeValues | FirstOrderInstantValues;

export type FOVExtractionInstruction = {
  name: string;
  periodType: 'RANGE' | 'INSTANT';
  synonyms: string[];
  statement: string;
};
