import axios from 'axios';
import { FilingResponse } from '../schema/sec/SECApiTypes';

type ReportType = '10-K' | '10-Q';
export default class SECStore {
  private apiUrl = 'https://api.sec-api.io';
  async getLatestReportDataFromCompany(
    cik: string,
    type: ReportType
  ): Promise<any> {
    // 1. Get reports
    const filingData = await this.getReportsFromCompany(cik, type);
    console.log(filingData);
    if (filingData.filings.length > 0) {
      const url = filingData.filings[0].linkToHtml;
      return this.convertHtmlLinkToJSON(url, type);
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
