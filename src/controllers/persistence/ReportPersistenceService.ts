import { Report } from '../../schema/ReportData';
import StoragePersistenceService from './StoragePersistenceService';

export default class ReportPersistenceService {
  private storageService: StoragePersistenceService;
  constructor() {
    this.storageService = new StoragePersistenceService();
  }

  async putReport(report: Report): Promise<void> {
    if (!process.env.BUCKETEER_BUCKET_NAME) {
      throw new Error('BUCKET NAME is not empty in env file');
    }

    await this.storageService.putObject(
      process.env.BUCKETEER_BUCKET_NAME,
      report.id,
      Buffer.from(JSON.stringify(report))
    );
  }

  async getReport(reportId: string): Promise<Report> {
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
