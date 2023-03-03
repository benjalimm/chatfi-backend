import { EmbeddingData } from '../EmbeddingTypes.js';

export default interface EmbeddingController {
  getEmbedding(input: string): Promise<EmbeddingData>;
}
