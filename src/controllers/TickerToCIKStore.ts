import fs from 'fs';
import path from 'path';
export default class TickerToCIKStore {
  private tickerToCIKMap: Map<string, string> = new Map();
  private filePath = '../../data/tickerToCik.txt'; // Relative to dist folder

  constructor() {
    this.loadTickerToCIKMap();
  }

  private loadTickerToCIKMap() {
    // 1. Load file
    const objectivePath = path.resolve(__dirname, this.filePath);
    const content = fs.readFileSync(objectivePath).toString();

    // 2. Split into different lines
    const lines = content.toString().split(`\n`);
    // 3. Iterate through line and store in map
    for (let line = 0; line < lines.length; line++) {
      const currentline = lines[line].split('\t');
      if (currentline[0] && currentline[1]) {
        const ticker = currentline[0].trim().replace(/["]/g, '');
        const cik = currentline[1].trim().replace(/["]/g, '');
        this.tickerToCIKMap.set(ticker, cik);
      }
    }
  }

  getCIKFromTicker(ticker: string): string | null {
    return this.tickerToCIKMap.get(ticker.toLowerCase()) || null;
  }
}
