import { strict } from 'assert';
import * as fs from 'fs';

export function extractJSONFromString<T>(str: string): T | null {
  if (!(str.includes('{') && str.includes('}'))) {
    return null;
  }

  const firstIndexOfOpenBracket = str.indexOf('{');
  const lastIndexOfCloseBracket = str.lastIndexOf('}');
  const jsonString = str.substring(
    firstIndexOfOpenBracket,
    lastIndexOfCloseBracket + 1
  );
  const json = JSON.parse(jsonString) as T;
  return json;
}

export function readJSON(filePath: string): any {
  const buffer = fs.readFileSync(filePath);
  return JSON.parse(buffer.toString());
}
