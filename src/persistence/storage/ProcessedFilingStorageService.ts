import { ProcessedFilingData } from '../../schema/sec/FilingData';
import StoragePersistenceService from './StoragePersistenceService';
import { Service } from 'typedi';

@Service()
export default class ProcessedFilingStorageService {
  constructor(storagePersistenceService: StoragePersistenceService) {
    this.storageService = storagePersistenceService;
  }

  private storageService: StoragePersistenceService;

  async putReport(filing: ProcessedFilingData): Promise<void> {
    if (!process.env.BUCKETEER_BUCKET_NAME) {
      throw new Error('BUCKET NAME is not empty in env file');
    }

    await this.storageService.putObject(
      process.env.BUCKETEER_BUCKET_NAME,
      filing.id,
      Buffer.from(JSON.stringify(filing))
    );
  }

  async getReport(filingId: string): Promise<ProcessedFilingData> {
    if (!process.env.BUCKETEER_BUCKET_NAME) {
      throw new Error('BUCKET NAME is not empty in env file');
    }

    const reportJSON = await this.storageService.getObject(
      process.env.BUCKETEER_BUCKET_NAME,
      filingId
    );

    return JSON.parse(reportJSON);
  }
}
