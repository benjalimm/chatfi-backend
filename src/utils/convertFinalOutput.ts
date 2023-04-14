import {
  FinalOutputData,
  Value
} from '../schema/dataTraversal/FinalPromptData';
import formatCurrencyNumber from './formatCurrencyNumber';

export default function convertFinalOutputJSONToString(
  finalOutputJSON: FinalOutputData
): string {
  let explanation = finalOutputJSON.answer;
  finalOutputJSON.values.forEach((value) => {
    explanation = explanation.replace(
      `@${value.key}`,
      outputValueString(value)
    );
  });
  return explanation;
}

function sanitizeNumberString(number: string): string {
  return number.replace(/,/g, '').replace(/$/g, '');
}

export function outputValueString(value: Value): string {
  function formatCurrency() {
    const numericValue = parseFloat(sanitizeNumberString(value.value));
    let multiplier = 1;

    if (value.sectionSource.toLowerCase().includes('.txt')) {
      switch (value.multiplier) {
        case 'IN_MILLIONS':
          multiplier = 1000000;
          break;
        case 'IN_THOUSANDS':
          multiplier = 1000;
          break;
      }
    }
    return formatCurrencyNumber(numericValue * multiplier);
  }
  console.log(value.unit);
  switch (value.unit) {
    case 'DOLLARS':
      return formatCurrency();
    case 'USD':
      return formatCurrency();

    default: {
      return `${value.value}`;
    }
  }
}
