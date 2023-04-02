import Container from 'typedi';
import LLMController from '../schema/controllers/LLMController';
import { ProcessedFilingData } from '../schema/sec/FilingData';
import ChatController from './ChatController';
import FilingJSONProcessor from './FilingJSONProcessor';
import SECStore from './SECStore';
import TickerSymbolExtractor from './TickerSymbolExtractor';
import TickerToCIKStore from './TickerToCIKStore';

export default class InputToFilingProcessor {
  private tsExtractor: TickerSymbolExtractor;
  private tickerToCIKStore: TickerToCIKStore;
  private secStore: SECStore;

  constructor(
    tsExtractor: TickerSymbolExtractor,
    tickerToCIKStore: TickerToCIKStore,
    secStore: SECStore
  ) {
    this.tsExtractor = tsExtractor;
    this.tickerToCIKStore = tickerToCIKStore;
    this.secStore = secStore;
  }

  async processInput(
    input: string,
    chatController?: ChatController
  ): Promise<ProcessedFilingData> {
    // 1. Extract ticker data
    const tickerData = await this.tsExtractor.extractTickerSymbolFromQuery(
      input
    );

    if (!tickerData?.ticker) {
      throw new Error('Ticker data is null');
    }

    chatController?.sendMsg(
      `Pulling info for ${tickerData.company} ($${tickerData.ticker})`
    );

    // 2. Get CIK from ticker
    const cik = this.tickerToCIKStore.getCIKFromTicker(tickerData.ticker);

    if (!cik) {
      throw new Error('CIK is null');
    }

    // 3. Get latest 10-K from CIK
    const { json, secFiling } =
      await this.secStore.getLatestReportDataFromCompany(cik, '10-K');

    // 4. Process and persist JSON to disc
    return FilingJSONProcessor.processJSON(json);
  }
}
