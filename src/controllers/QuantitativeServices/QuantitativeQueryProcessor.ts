import LLMController from '../../schema/controllers/LLMController';
import { ExtractedValue } from '../../schema/ExtractedValue';
import { Formula } from '../../schema/FormulaType';
import ExtractedValueMatchService from './ExtractedValueMatchService';
import FormulaMatchService from './FormulaMatchService';
import GeneratedCodeExecutor from './GeneratedCodeExecutor';
import QuantEntityExtractionService from './QuantEntityExtractionService';
import QuantEntityMatchingService from './QuantEntityMatchingService';

export default class QuantitativeQueryProcessor {
  private llmController: LLMController;
  private entityExtractionService: QuantEntityExtractionService;
  private entityMatchingService: QuantEntityMatchingService;
  private generatedCodeExecutor: GeneratedCodeExecutor;

  constructor(llmController: LLMController) {
    this.llmController = llmController;
    this.entityExtractionService = new QuantEntityExtractionService(
      llmController
    );
    this.entityMatchingService = new QuantEntityMatchingService();
    this.generatedCodeExecutor = new GeneratedCodeExecutor(llmController);
  }

  async processQuery(query: string): Promise<number> {
    // 1. Extract entities
    console.log('Extracting resolved entities');
    const resolvedEntities =
      await this.entityExtractionService.extractEntitiesFromQuery(query);
    console.log(`Successfully extracted ${resolvedEntities.length} entities`);

    // 2. Split resolved entities into extracted values and formulas
    const formulas: Formula[] = [];
    const extractedValues: ExtractedValue[] = [];
    console.log(`Attempting to split extracted values and formulas`);
    for (const resolvedEntity of resolvedEntities) {
      if (resolvedEntity.type === 'formula') {
        formulas.push(resolvedEntity.formula);
      } else {
        extractedValues.push(resolvedEntity.value);
      }
    }

    console.log(
      `Successfully split extracted values (Count: ${extractedValues.length}) and formulas. (Count: ${formulas.length})`
    );

    // 3. Generate executable code
    const executable = await this.generatedCodeExecutor.outputExecutable(
      formulas.map((f) => f.formula),
      extractedValues,
      query
    );

    console.log(`Generated executable code: ${executable}`);

    // 4. Execute value
    const getFinalValue = new Function(executable);
    const value = getFinalValue() as number;
    console.log(`Final value: ${value}`);
    return value;
  }
}
