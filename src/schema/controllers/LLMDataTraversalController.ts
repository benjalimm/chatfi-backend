export default interface LLMDataTraversalController {
  // If arbitrary string is passed in, it means query custom financial statement
  generateFinalPrompt(query: string): Promise<DataTraversalPromptResult>;
}
