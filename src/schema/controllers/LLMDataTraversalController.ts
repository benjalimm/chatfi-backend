import { DataTraversalResult } from '../DataTraversalResult.js';

export default interface LLMDataTraversalController {
  // If arbitrary string is passed in, it means query custom financial statement
  extractRelevantData(query: string): Promise<DataTraversalResult>;
}
