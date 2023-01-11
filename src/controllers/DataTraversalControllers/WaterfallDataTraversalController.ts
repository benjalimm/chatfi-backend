import LLMController from '../../schema/controllers/LLMController';
import reportMetadata from '../../sampleData/COINBASE_10_Q/metadata.json';
import BaseDataTraversalContoller from './BaseDataTraversalContoller';

export default class WaterfallDataTraversalController extends BaseDataTraversalContoller {
  constructor(llmController: LLMController, dataFilePath: string) {
    super(llmController, dataFilePath);
    this.listOfStatements = reportMetadata.statements;
  }

  async generateFinalPrompt(query: string): Promise<string> {
    return query;
  }
}
