var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'jest';
import { GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT } from '../../src/controllers/DataTraversalControllers/Prompts';
import { extractJSONFromString, readTxt } from '../../src/controllers/DataTraversalControllers/Utils';
import OpenAIController from '../../src/controllers/OpenAIController';
const TEST_OUTPUT_SCHEMA = `
    {
      "verified": boolean, 
      "reasonForNonVerified": "string"; // empty string if verified
    }
`;
const openAIController = new OpenAIController();
function verifyExtractedData(extractedData, expectedData) {
    return __awaiter(this, void 0, void 0, function* () {
        const PROMPT = `${extractedData}
    Based on the data above, verify the following facts:
    ${expectedData}
    

    Return a single JSON output with the following schema if all facts are verified:
    ${TEST_OUTPUT_SCHEMA}
    `;
        const resultString = yield openAIController.executePrompt(PROMPT);
        return extractJSONFromString(resultString);
    });
}
describe('Proper extraction of values from TXT files', () => {
    jest.setTimeout(100000);
    // 1. Test data from PlatformOperatorCryptoAssetTextBlock.txt
    it('Should extract values from platform operator txt file correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const statement = 'CUSTOMERASSETSANDLIABILITIES';
        const section = 'PlatformOperatorCryptoAssetTextBlock.txt';
        const data = readTxt(`../../sampleData/COINBASE_10_Q/${statement}/${section}`);
        const query = "Give me a summary of Coinbase's restructuring costs";
        const prompt = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(statement, data, query);
        const extractedData = yield openAIController.executePrompt(prompt);
        const { verified, reasonForNonVerified } = yield verifyExtractedData(extractedData, `
      1. Customer crypto liabilites on Sept 30 2022 is 95113124
      2. totalCustomerLiabilities on Sept 30 2022 is 101470781 
      3. Customer custodial cash on Sept 30 2022 is 6591105
      4. The multipler is IN_THOUSANDS`);
        if (!verified) {
            console.log(`Failed to verify data due to reason: ${reasonForNonVerified}`);
        }
        expect(verified).toBe(true);
    }));
    // 2. Second txt value file check
    it('Should extract values from schedule of employee service shared txt file correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const statement = 'STOCKBASEDCOMPENSATIONTables';
        const section = 'ScheduleOfEmployeeServiceShareBasedCompensationAllocationOfRecognizedPeriodCostsTextBlock.txt';
        const data = readTxt(`../../sampleData/COINBASE_10_Q/${statement}/${section}`);
        const query = 'Give me a summary of stock based compensation';
        const prompt = GEN_SEGMENT_TXT_DATA_EXTRACTION_PROMPT(statement, data, query);
        const extractedData = yield openAIController.executePrompt(prompt);
        const { verified, reasonForNonVerified } = yield verifyExtractedData(extractedData, `
      1. Technology and development on Sept 30 2022 is 275817
      2. Sales and marketing on Sept 30 2022 is 18461
      3. General and administrative on 30 Sept 2022 is 97163
      4. The multipler is IN_THOUSANDS`);
        if (!verified) {
            console.log(`Failed to verify data due to reason: ${reasonForNonVerified}`);
        }
        expect(verified).toBe(true);
    }));
});
