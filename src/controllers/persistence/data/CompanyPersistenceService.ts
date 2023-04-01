import { SECFiling } from '../../../schema/sec/SECApiTypes';
import BaseDataPersistenceService from './BaseDataPersistenceService';

export default class CompanyPersistenceService extends BaseDataPersistenceService {
  async createOrGetCompanyFromFiling(filing: SECFiling) {
    return this.onMain(async () => {
      const getCompany = await this.prisma.company.findUnique({
        where: { cik: filing.cik, ticker: filing.ticker }
      });

      if (getCompany) {
        return getCompany;
      }
      return await this.prisma.company.create({
        data: {
          cik: filing.cik,
          companyName: filing.companyName,
          ticker: filing.ticker
        }
      });
    });
  }
}
