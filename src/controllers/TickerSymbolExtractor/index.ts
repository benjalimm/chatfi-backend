import LLMController from '../../schema/controllers/LLMController';
import { extractJSONFromString } from '../DataTraversalControllers/Utils';
import { GEN_TICKER_EXTRACTION_PROMPT } from './prompts';
import { Service } from 'typedi';

export type TickerData = {
  company: string;
  ticker: string;
};

@Service()
export default class TickerSymbolExtractor {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }

  async extractTickerSymbolFromQuery(
    query: string
  ): Promise<TickerData | null> {
    const response = await this.llmController.executePrompt(
      GEN_TICKER_EXTRACTION_PROMPT(query)
    );

    const tickerData = extractJSONFromString<TickerData>(response);

    if (tickerData && tickerData.company && tickerData.ticker) {
      return tickerData;
    }

    return null;
  }
}
