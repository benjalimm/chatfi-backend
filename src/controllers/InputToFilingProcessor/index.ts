import Container, { Service } from 'typedi';
import LLMController from '../../schema/controllers/LLMController';
import { ProcessedFilingData } from '../../schema/sec/FilingData';
import { SECFiling } from '../../schema/sec/SECApiTypes';
import ChatController from '../ChatController';
import FilingJSONProcessor from '../FilingJSONProcessor';
import SECStore from '../SECStore';
import TickerSymbolExtractor from '../TickerSymbolExtractor';
import TickerToCIKStore from '../TickerToCIKStore';

type Response = { data: ProcessedFilingData; secFiling: SECFiling };
@Service()
export default class InputToFilingProcessor {
  private tsExtractor: TickerSymbolExtractor;
  private tickerToCIKStore: TickerToCIKStore;
  private secStore: SECStore;
  private filingJSONProcessor: FilingJSONProcessor;

  constructor(
    tsExtractor: TickerSymbolExtractor,
    tickerToCIKStore: TickerToCIKStore,
    secStore: SECStore,
    filingJSONProcessor: FilingJSONProcessor
  ) {
    this.tsExtractor = tsExtractor;
    this.tickerToCIKStore = tickerToCIKStore;
    this.secStore = secStore;
    this.filingJSONProcessor = filingJSONProcessor;
  }

  async processInput(
    input: string,
    chatController?: ChatController
  ): Promise<Response> {
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
    const processedData = this.filingJSONProcessor.processJSON(
      tickerData.ticker,
      json
    );
    return {
      data: processedData,
      secFiling
    };
  }
}
