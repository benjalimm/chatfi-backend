import LLMController from '../schema/controllers/LLMController';

type QueryType = 'QUANTITATIVE' | 'QUALITATIVE' | 'BOTH';
export default class QueryTypeController {
  private llmController: LLMController;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
  }
  determineQueryType(query: string): QueryType {
    return 'QUANTITATIVE';
  }
}
