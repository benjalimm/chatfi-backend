import { ProcessedFilingData } from '../../schema/sec/FilingData';
import StoragePersistenceService from './StoragePersistenceService';
import { Service, Container } from 'typedi';

@Service()
export default class ProcessedFilingStorageService {
  constructor(storagePersistenceService: StoragePersistenceService) {
    this.storageService = storagePersistenceService;
  }

  private storageService: StoragePersistenceService;

  async putReport(report: ProcessedFilingData): Promise<void> {
    if (!process.env.BUCKETEER_BUCKET_NAME) {
      throw new Error('BUCKET NAME is not empty in env file');
    }

    await this.storageService.putObject(
      process.env.BUCKETEER_BUCKET_NAME,
      report.id,
      Buffer.from(JSON.stringify(report))
    );
  }

  async getReport(reportId: string): Promise<ProcessedFilingData> {
    if (!process.env.BUCKETEER_BUCKET_NAME) {
      throw new Error('BUCKET NAME is not empty in env file');
    }

    const reportJSON = await this.storageService.getObject(
      process.env.BUCKETEER_BUCKET_NAME,
      reportId
    );

    return JSON.parse(reportJSON);
  }
}
