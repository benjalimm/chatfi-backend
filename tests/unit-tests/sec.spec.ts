import { application } from 'express';
import 'jest';
import OpenAIController from '../../src/controllers/LLMControllers/OpenAIController';
import SECStore from '../../src/controllers/SECStore';
import TickerSymbolExtractor, {
  TickerData
} from '../../src/controllers/TickerSymbolExtractor';
import TickerToCIKStore from '../../src/controllers/TickerToCIKStore';

describe('Testing SEC data extraction and api', () => {
  // 1. Initialize services
  const controller = new OpenAIController();

  const query = "What was Coinbase's net revenue in 2022?";
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

  let secStore: SECStore;
  test('Test pulling latest 10-K from cik number', async () => {
    if (!cik) {
      throw new Error('CIK is null');
    }

    secStore = new SECStore();
    const result = await secStore.getLatestReportDataFromCompany(cik, '10-K');
    expect(result.CoverPage.TradingSymbol).toBe('COIN');
  });
});
