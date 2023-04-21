import { Router } from 'express';
import Container from 'typedi';
import ProcessedFilingStorageService from '../persistence/storage/ProcessedFilingStorageService';
import {
  convertProcessedSectionToCombinedLineItems,
  convertProcessedSectionToCombinedTextOrLineItems
} from '../utils/convertProcessedFilings';

const pFilingRouter = Router();

pFilingRouter.get('/:key/:statement', async (req, res) => {
  const key = req.params.key as string;
  const statement = req.params.statement as string;
  console.log(`key: ${key} // statement: ${statement}}`);
  const filingService = Container.get(ProcessedFilingStorageService);

  try {
    const filing = await filingService.getReport(key);
    const statementData = filing.statements[statement];
    if (filing) {
      const data = convertProcessedSectionToCombinedTextOrLineItems(
        statementData.sections
      );
      if (data) {
        res.status(200).json({ data });
      } else {
        res.status(404).json({ error: 'Statement not found' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

export default pFilingRouter;
