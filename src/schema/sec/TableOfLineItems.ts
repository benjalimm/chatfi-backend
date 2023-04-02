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

export type Period =
  | {
      instant: string;
    }
  | {
      startDate: string;
      endDate: string;
    };

export type TableOfLineItems = { [key: string]: LineItem | LineItem[] };
