import fs from 'fs';
import path, { resolve } from 'path';
import { convert } from 'html-to-text';
import { Report } from '../schema/ReportData';
export default class ReportJSONProcessor {
  private tmpFilePath: string;
  constructor(tmpFilePath: string) {
    this.tmpFilePath = '../..';
  }

  processJSON(json: any): Report {
    // 1. Create new report object
    const { TradingSymbol, DocumentType, DocumentPeriodEndDate } =
      json.CoverPage;
    const uniqueId = `${TradingSymbol}_${DocumentType}_${DocumentPeriodEndDate}`;
    const report: Report = { id: uniqueId, listOfDocs: [], documents: {} };

    // 2. Iterate through each section key
    for (const key in json) {
      // 2.1 - Append key to metadata
      report.listOfDocs.push(key);

      // We init a document for each key
      report.documents[key] = {
        name: key,
        listOfSections: [],
        sections: {}
      };

      // 3. Iterate through sub keys
      for (const subkey in json[key]) {
        report.documents[key].listOfSections.push(subkey);
        // We init a section for each subkey, default to json
        report.documents[key].sections[subkey] = {
          name: subkey,
          filetype: 'json',
          data: ''
        };

        // 4. Check if data is html
        let data = JSON.stringify(json[key][subkey]);
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(data);

        // 3.1 Keep track of list of documents

        // 5. If html, convert to text + save as txt
        if (isHtml) {
          data = convert(data, {
            wordwrap: 130
          });
          report.documents[key].sections[subkey].filetype = 'txt';
        } else {
          const customObj: { [key: string]: unknown } = {};
          customObj[subkey] = JSON.parse(data);
          data = JSON.stringify(customObj);
        }

        report.documents[key].sections[subkey].data = data;
      }

      // 7. Save metadata of subkeys
    }
    return report;
  }

  async processJSONAndWriteToDisc(json: any): Promise<string> {
    return new Promise((res, rej) => {
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
        } else {
          res(PATH);
        }
      });
      return PATH;
    });
  }
}
