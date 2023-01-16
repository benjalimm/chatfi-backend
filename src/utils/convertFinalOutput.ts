import { FinalOutputJSON, Value } from '../schema/FinalPromptJSON';

export default function convertFinalOutputJSONToString(
  finalOutputJSON: FinalOutputJSON
): string {
  let explanation = finalOutputJSON.explanation;
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
    case '%':
      return `${value.value}%`;
    default:
      return `${value.unit}${value.value}`;
  }
}
