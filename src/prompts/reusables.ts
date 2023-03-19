export const PREVENT_HALLUCINATION = (noAnswerInstruction: string) =>
  `Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the context, ${noAnswerInstruction}.`;
