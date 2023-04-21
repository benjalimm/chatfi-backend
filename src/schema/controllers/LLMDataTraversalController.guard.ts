/*
 * Generated type guards for "LLMDataTraversalController.ts".
 * WARNING: Do not manually change this file.
 */
import LLMDataTraversalController from './LLMDataTraversalController';

export function isLLMDataTraversalController(
  obj: unknown
): obj is LLMDataTraversalController {
  const typedObj = obj as LLMDataTraversalController;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['extractRelevantData'] === 'function'
  );
}
