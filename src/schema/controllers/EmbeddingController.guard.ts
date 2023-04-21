/*
 * Generated type guards for "EmbeddingController.ts".
 * WARNING: Do not manually change this file.
 */
import EmbeddingController from './EmbeddingController';

export function isEmbeddingController(
  obj: unknown
): obj is EmbeddingController {
  const typedObj = obj as EmbeddingController;
  return (
    ((typedObj !== null && typeof typedObj === 'object') ||
      typeof typedObj === 'function') &&
    typeof typedObj['getEmbedding'] === 'function'
  );
}
