import { Service } from 'typedi';
import { ProcessedFilingData } from '../../schema/sec/FilingData';

@Service()
export default class FilingJSONProcessor {
  processJSON(ticker: string, json: any): ProcessedFilingData {
    // 1. Create new report object
    const { DocumentType, DocumentPeriodEndDate } = json.CoverPage;
    const uniqueId = `${ticker}_${DocumentType}_${DocumentPeriodEndDate}`;
    const report: ProcessedFilingData = {
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
        // 4. Check if data is html
        const originalData = JSON.stringify(json[key][subkey]);
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(originalData);

        // 3.1 Keep track of list of documents

        // 5. If html, convert to text + save as txt
        if (isHtml) {
          report.statements[key].sections[subkey] = {
            fileType: 'html',
            htmlData: originalData
          };
        } else {
          const customObj: { [key: string]: unknown } = {};
          customObj[subkey] = JSON.parse(originalData);
          const jsonData = JSON.stringify(customObj);

          report.statements[key].sections[subkey] = {
            fileType: 'json',
            jsonData
          };
        }
      }
    }
    return report;
  }
}
