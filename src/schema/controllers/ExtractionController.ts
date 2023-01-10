import { PrimaryDocumentType } from '../DocumentType';

export default interface LLMSearchController {
  // If arbitrary string is passed in, it means query custom financial statement
  generateFinalPrompt(query: string): Promise<string>;
}
