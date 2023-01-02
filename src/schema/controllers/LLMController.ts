export default interface LLMController{
  executePrompt(text: string): Promise<string>;
}