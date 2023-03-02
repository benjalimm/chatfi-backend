export type EmbeddingData = {
  embedding: number[];
  index: number;
  object: 'embedding';
};

export type EmbeddingResponse = {
  data: EmbeddingData[];
  model: 'text-embedding-ada-002';
};
