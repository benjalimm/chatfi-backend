import { FinalOutputJSON, Value } from '../schema/FinalPromptJSON';
import formatCurrencyNumber from './formatCurrencyNumber';

export default function convertFinalOutputJSONToString(
  finalOutputJSON: FinalOutputJSON
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

function outputValueString(value: Value): string {
  switch (value.unit) {
    case 'PERCENTAGE':
      return `${value.value}%`;
    case 'DOLLARS':
      return formatCurrencyNumber(value.value);
    default: {
      return `${value.value}`;
    }
  }
}
