export function extractSingularJSONFromString(str: string): string {
  const strings = str.split('{');

  if (strings.length === 0) {
    return str;
  }

  // Add back opening bracket
  const jsonString = '{ ' + strings[strings.length - 1];
  return jsonString;
}
