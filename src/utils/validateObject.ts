export function validateBody<T extends object>(
  json: any,
  exampleObj: T
): json is T {
  // Do validation or throw error
  for (const key of Object.keys(exampleObj)) {
    if (json[key] === undefined) {
      return false;
    }
  }
  return true;
}
