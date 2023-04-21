export type LineItem = {
  decimals: string;
  unitRef: string;
  segment?: {
    dimension: string;
    value: string;
  };
  period: Period;
  value: string;
};

export type InstantPeriod = {
  instant: string;
};

export type RangePeriod = {
  startDate: string;
  endDate: string;
};

export type Period = InstantPeriod | RangePeriod;
export type TableOfLineItems = { [key: string]: LineItem | LineItem[] };

export type ArrayOfLineItems = LineItem[];
