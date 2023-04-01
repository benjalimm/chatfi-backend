import fs from 'fs';
import path, { resolve } from 'path';
import { convert } from 'html-to-text';
import { FilingData } from '../schema/sec/FilingData';
export default class FilingJSONProcessor {
  static processJSON(json: any): FilingData {
    // 1. Create new report object
    const { TradingSymbol, DocumentType, DocumentPeriodEndDate } =
      json.CoverPage;
    const uniqueId = `${TradingSymbol}_${DocumentType}_${DocumentPeriodEndDate}`;
    const report: FilingData = {
      id: uniqueId,
      listOfStatements: [],
      statements: {}
    };

    // 2. Iterate through each section key
    for (const key in json) {
      // 2.1 - Append key to metadata
      report.listOfStatements.push(key);

      // We init a document for each key
      report.statements[key] = {
        name: key,
        listOfSections: [],
        sections: {}
      };

      // 3. Iterate through sub keys
      for (const subkey in json[key]) {
        report.statements[key].listOfSections.push(subkey);
        // We init a section for each subkey, default to json
        report.statements[key].sections[subkey] = {
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
          report.statements[key].sections[subkey].filetype = 'txt';
        } else {
          const customObj: { [key: string]: unknown } = {};
          customObj[subkey] = JSON.parse(data);
          data = JSON.stringify(customObj);
        }

        report.statements[key].sections[subkey].data = data;
      }
    }
    return report;
  }
}
