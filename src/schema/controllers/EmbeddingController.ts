import { EmbeddingData } from '../EmbeddingTypes';

export default interface EmbeddingController {
  getEmbedding(input: string): Promise<EmbeddingData>;
}
