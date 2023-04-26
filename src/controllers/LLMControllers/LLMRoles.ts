import Container from 'typedi';
import LLMController from '../../schema/controllers/LLMController';
import GPT4Controller from './GPT4Controller';
import OpenAIController from './OpenAIController';

interface LLMRolesInterface {
  extractionLLM: LLMController;
  finalReasonLLM: LLMController;
}

const LLMRoles: LLMRolesInterface = {
  extractionLLM: Container.get(OpenAIController),
  finalReasonLLM: Container.get(GPT4Controller)
};

export default LLMRoles;
