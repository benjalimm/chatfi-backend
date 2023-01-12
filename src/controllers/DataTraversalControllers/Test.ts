import * as fs from 'fs';
import { readJSON } from './Utils';
function readFile() {
  const data = fs.readdirSync(`../../sampleData/COINBASE_10_Q`);
  console.log(`JSON:  ${data.toString()}`);
}

readFile();
