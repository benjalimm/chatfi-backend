import LLMController from '../schema/controllers/LLMController';
import { Report } from '../schema/ReportData';
import ReportJSONProcessor from './ReportJSONProcessor';
import SECStore from './SECStore';
import TickerSymbolExtractor from './TickerSymbolExtractor';
import TickerToCIKStore from './TickerToCIKStore';

export default class InputReportDataGenerator {
  private llmController: LLMController;
  private tsExtractor: TickerSymbolExtractor;
  private tickerToCIKStore: TickerToCIKStore;
  private secStore: SECStore;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.tsExtractor = new TickerSymbolExtractor(llmController);
    this.tickerToCIKStore = new TickerToCIKStore();
    this.secStore = new SECStore();
  }

  async processInput(input: string): Promise<Report> {
    // 1. Extract ticker data
    const tickerData = await this.tsExtractor.extractTickerSymbolFromQuery(
      input
    );

    if (!tickerData?.ticker) {
      throw new Error('Ticker data is null');
    }

    // 2. Get CIK from ticker
    const cik = this.tickerToCIKStore.getCIKFromTicker(tickerData.ticker);

    if (!cik) {
      throw new Error('CIK is null');
    }

    // 3. Get latest 10-K from CIK
    const reportJSON = await this.secStore.getLatestReportDataFromCompany(
      cik,
      '10-K'
    );

    // 4. Process and persist JSON to disc
    return ReportJSONProcessor.processJSON(reportJSON);
  }
}
