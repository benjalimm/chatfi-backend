export type ExtractedRangeValue = {
  name: string;
  type: 'RANGE';
  values: {
    value: number;
    unit: string;
    startDate: string;
    endDate: string;
  }[];
};

export type ExtractedInstantValue = {
  name: string;
  type: 'INSTANT';
  values: {
    value: number;
    unit: string;
    date: string;
  }[];
};

export type ExtractedValue = ExtractedRangeValue | ExtractedInstantValue;
