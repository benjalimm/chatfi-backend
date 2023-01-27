import LLMController from '../schema/controllers/LLMController';
import ExtractedValueMatchService from './ExtractedValueMatchService';
import FormulaMatchService from './FormulaMatchService';

export default class QuantitativeQueryProcessor {
  private llmController: LLMController;
  private formulaMatchService: FormulaMatchService;
  private extractedValueMatchService: ExtractedValueMatchService;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.formulaMatchService = new FormulaMatchService(llmController);
    this.extractedValueMatchService = new ExtractedValueMatchService();
  }

  async processQuery(query: string) {
    // Get formula type

    const formula = await this.formulaMatchService.matchQueryWithFormula(query);

    if (formula) {
      const properties =
        this.extractedValueMatchService.matchPropertiesWithValues(
          formula.properties
        );

      // For simplicity, let's assume that all properties are indexed
      if (properties.includes(null))
        throw new Error('Some properties have not been indexed');
    }
    throw new Error(`No formula for query ("${query}") has been indexed`);
  }
}
