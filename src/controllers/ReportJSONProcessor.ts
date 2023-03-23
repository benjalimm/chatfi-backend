import fs from 'fs';
import path from 'path';
import { convert } from 'html-to-text';
export default class ReportJSONProcessor {
  private tmpFilePath: string;
  constructor(tmpFilePath: string) {
    this.tmpFilePath = '../../dist';
  }

  processJSONAndWriteToDisc(json: any): string {
    const listOfStatements = [];
    const { TradingSymbol, DocumentType, DocumentPeriodEndDate } =
      json.CoverPage;
    const uniqueId = `${TradingSymbol}_${DocumentType}_${DocumentPeriodEndDate}`;
    const PATH = path.resolve(__dirname, `${this.tmpFilePath}/${uniqueId}`);

    if (!fs.existsSync(PATH)) {
      fs.mkdirSync(PATH);
    }

    // 1. Iterate through parent keys
    for (const key in json) {
      const path = `${PATH}/${key}`;

      // 1.1 Keep track of list of parent keys
      listOfStatements.push(key);

      // 2.  Create if parent directory doesn't exist
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      // 3. Iterate through sub keys
      const listOfSegments = [];
      for (const subkey in json[key]) {
        // 4. Check if data is html
        let data = JSON.stringify(json[key][subkey]);
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(data);

        let file = `${subkey}.json`;

        // 3.1 Keep track of list of documents

        // 5. If html, convert to text + save as txt
        if (isHtml) {
          data = convert(data, {
            wordwrap: 130
          });
          file = `${subkey}.txt`;
        } else {
          const customObj: { [key: string]: unknown } = {};
          customObj[subkey] = JSON.parse(data);
          data = JSON.stringify(customObj);
        }

        listOfSegments.push(file);

        // 6. Write file
        const finalPath = `${path}/${file}`;
        fs.writeFile(finalPath, data, (err) => {
          if (err) {
            console.log(`ERROR: ${err}`);
          }
        });
      }

      // 7. Save metadata of subkeys
      const metadata = JSON.stringify({ segments: listOfSegments });
      fs.writeFile(`${path}/metadata.json`, metadata, (err) => {
        if (err) {
          console.log(`ERROR: ${err}`);
        }
      });
    }

    // 8. Save metadata of parent keys
    const metadata = JSON.stringify({ statements: listOfStatements });
    fs.writeFile(`${PATH}/metadata.json`, metadata, (err) => {
      if (err) {
        console.log(`ERROR: ${err}`);
      }
    });
    return PATH;
  }
}
