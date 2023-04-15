import { Service, Container } from 'typedi';
import { SECFiling } from '../../schema/sec/SECApiTypes';
import BaseDataPersistenceService from './BaseDataPersistenceService';
import CompanyPersistenceService from './CompanyPersistenceService';

@Service()
export default class FilingPersistenceService extends BaseDataPersistenceService {
  private companyPersistenceService: CompanyPersistenceService;
  constructor(companyPersistenceService: CompanyPersistenceService) {
    super();
    this.companyPersistenceService = companyPersistenceService;
  }

  async getFiling(key: string) {
    return this.prisma.filing.findUnique({ where: { id: key } });
  }

  async createOrGetFiling(key: string, secFiling: SECFiling) {
    return this.onMain(async () => {
      // 1. Check if filing exist
      const filing = await this.getFiling(key);

      if (filing) {
        return filing;
      }

      // 2. Make sure company exist
      await this.companyPersistenceService.createOrGetCompanyFromFiling(
        secFiling
      );
      const { cik, filedAt, formType, linkToHtml, linkToFilingDetails } =
        secFiling;
      const filingType = formType === '10-K' ? 'TENK' : 'TENQ';

      // 3. Create filing
      return await this.prisma.filing.create({
        data: {
          id: key,
          cik,
          filingDate: filedAt,
          filingType,
          linkToHtml,
          linkToFilingDetails
        }
      });
    });
  }
}
