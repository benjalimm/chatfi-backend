import 'jest';
import OpenAIController from '../../src/controllers/LLMControllers/OpenAIController';
import ReportJSONProcessor from '../../src/controllers/ReportJSONProcessor';
import SECStore from '../../src/controllers/SECStore';
import TickerSymbolExtractor, {
  TickerData
} from '../../src/controllers/TickerSymbolExtractor';
import TickerToCIKStore from '../../src/controllers/TickerToCIKStore';

describe('Testing SEC data extraction and api', () => {
  const controller = new OpenAIController();
  const query = "What was Coinbase's net revenue in 2022?";

  // 1. Test ticker extraction
  let tickerSymbolExtractor: TickerSymbolExtractor;
  let tickerData: TickerData | null = null;
  test('Test company ticker extraction', async () => {
    tickerSymbolExtractor = new TickerSymbolExtractor(controller);
    const result = await tickerSymbolExtractor.extractTickerSymbolFromQuery(
      query
    );
    tickerData = result;
    expect(result?.ticker).toBe('COIN');
  });

  // 2. Test ticker to CIK resolve
  let tickerToCikStore: TickerToCIKStore;
  let cik: string | null = null;
  test('Test cik extraction', () => {
    tickerToCikStore = new TickerToCIKStore();

    if (!tickerData) {
      throw new Error('Ticker data is null');
    }
    cik = tickerToCikStore.getCIKFromTicker(tickerData.ticker);
    expect(cik).toBe('1679788');
  });

  // 3. Test pulling latest 10-K from cik number
  let secStore: SECStore;
  let result: any;
  test('Test pulling latest 10-K from cik number', async () => {
    if (!cik) {
      throw new Error('CIK is null');
    }

    secStore = new SECStore();
    result = await secStore.getLatestReportDataFromCompany(cik, '10-K');
    expect(result.CoverPage.TradingSymbol).toBe('COIN');
  });
  let reportJSONProcessor: ReportJSONProcessor;
  let reportFilePath: string;

  // 4. Test writing 10-K json to disc
  test('Test writing 10-K json to disc', async () => {
    reportJSONProcessor = new ReportJSONProcessor('../../dist');
    reportFilePath = await reportJSONProcessor.processJSONAndWriteToDisc(
      result
    );
  });
});
