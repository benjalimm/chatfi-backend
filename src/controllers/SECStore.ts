import axios from 'axios';
import { FilingResponse, SECFiling } from '../schema/sec/SECApiTypes';
import { Service } from 'typedi';
type ReportType = '10-K' | '10-Q' | '8-K';
type Response = { json: any; secFiling: SECFiling };
@Service()
export default class SECStore {
  private apiUrl = 'https://api.sec-api.io';
  async getLatestReportDataFromCompany(
    cik: string,
    type: ReportType
  ): Promise<Response> {
    // 1. Get reports
    const filingData = await this.getReportsFromCompany(cik, type);
    console.log(filingData);
    if (filingData.filings.length > 0) {
      const secFiling = filingData.filings[0];
      const json = await this.convertHtmlLinkToJSON(secFiling.linkToHtml, type);
      return {
        json,
        secFiling
      };
    }
    throw new Error(`No ${type} reports found for ${cik}`);
  }

  private async getReportsFromCompany(
    cik: string,
    type: ReportType
  ): Promise<FilingResponse> {
    const { data } = await axios.post(
      `${this.apiUrl}?token=${process.env.SEC_API_TOKEN}`,
      {
        query: {
          query_string: { query: `formType:"${type}" AND cik:"${cik}"` }
        },
        from: 0,
        size: 20,
        sort: [{ filedAt: { order: 'desc' } }]
      }
    );

    return data as FilingResponse;
  }

  private async convertHtmlLinkToJSON(
    url: string,
    reportType: ReportType
  ): Promise<any> {
    const { data } = await axios.get(`${this.apiUrl}/xbrl-to-json`, {
      params: {
        'xbrl-url': url,
        token: process.env.SEC_API_TOKEN
      }
    });

    if (data.CoverPage.DocumentType === reportType) {
      return data;
    }
    throw new Error(`Invalid data`);
  }
}
