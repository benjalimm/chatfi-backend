import { Container } from 'typedi';
import OpenAIController from './controllers/LLMControllers/OpenAIController';
export const TYPE = {
  LLMController: 'LLMController'
};
export function inject() {
  // All classes get automatically injected through the @Service decorator
  // This function allows any additional dependencies to be injected like interfaces

  // Default openAIController to
  const openAIController = Container.get(OpenAIController);
  Container.set(TYPE.LLMController, openAIController);
}
