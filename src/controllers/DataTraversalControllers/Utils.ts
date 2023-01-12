import { strict } from 'assert';
import * as fs from 'fs';
import path from 'path';

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
  const objectivePath = path.resolve(__dirname, filePath);
  const buffer = fs.readFileSync(objectivePath);
  return JSON.parse(buffer.toString());
}

export function readTxt(filePath: string): string {
  const objectivePath = path.resolve(__dirname, filePath);
  return fs.readFileSync(objectivePath, 'utf8');
}
