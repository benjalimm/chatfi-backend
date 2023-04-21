/*
 * Generated type guards for "LLMController.ts".
 * WARNING: Do not manually change this file.
 */
import LLMController from './LLMController';

export function isLLMController(obj: unknown): obj is LLMController {
  const typedObj = obj as LLMController;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['executePrompt'] === 'function'
  );
}
