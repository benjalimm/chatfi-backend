import { Service, Container } from 'typedi';
import { SECFiling } from '../../schema/sec/SECApiTypes';
import BaseDataPersistenceService from './BaseDataPersistenceService';
import CompanyPersistenceService from './CompanyPersistenceService';

@Service()
export default class FilingPersistenceService extends BaseDataPersistenceService {
  private companyPersistenceService = Container.get(CompanyPersistenceService);

  async createOrGetFilingFromFiling(filing: SECFiling) {
    return this.onMain(async () => {
      // 1. Make sure company exists
      await this.companyPersistenceService.createOrGetCompanyFromFiling(filing);
      const { id, cik, filedAt, formType, linkToHtml, linkToFilingDetails } =
        filing;
    });
  }
}
