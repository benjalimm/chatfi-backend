import { SECFiling } from '../../../schema/sec/SECApiTypes';
import BaseDataPersistenceService from './BaseDataPersistenceService';

export default class FilingPersistenceService extends BaseDataPersistenceService {
  async createOrGetFilingFromFiling(filing: SECFiling) {
    return this.onMain(async () => {
      // 1. Make sure company exists
      return 1;
    });
  }
}
