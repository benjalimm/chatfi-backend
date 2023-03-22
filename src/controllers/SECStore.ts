import axios from 'axios';
import { FilingResponse } from '../schema/SECApiTypes';

type ReportType = '10-K' | '10-Q';
export default class SECStore {
  async getLatestReportDataFromCompany(
    cik: string,
    type: ReportType
  ): Promise<any> {
    // 1. Get reports
    const filingData = await this.getReportsFromCompany(cik, type);
  }

  private async getReportsFromCompany(
    cik: string,
    type: ReportType
  ): Promise<FilingResponse> {
    const { data } = await axios.post(
      `https://api.sec-api.io?token=${process.env.SEC_API_TOKEN}`,
      {
        query: { query_string: `formType:"${type}" AND cik:"${cik}"` },
        from: 0,
        size: 20,
        sort: [{ filedAt: { order: 'desc' } }]
      }
    );

    return data as FilingResponse;
  }
}
