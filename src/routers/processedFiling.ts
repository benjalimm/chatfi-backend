import { Router } from 'express';
import Container from 'typedi';
import ProcessedFilingStorageService from '../persistence/storage/ProcessedFilingStorageService';
import {
  convertProcessedSectionToCombinedLineItems,
  convertProcessedStatementToCombinedLineItems
} from '../utils/convertProcessedFilings';

const pFilingRouter = Router();

pFilingRouter.get('/:key/:statement', async (req, res) => {
  const key = req.params.key as string;
  console.log(`key: ${key}`);
  const statement = req.params.statement as string;
  const filingService = Container.get(ProcessedFilingStorageService);

  try {
    const filing = await filingService.getReport(key);
    const statementData = filing.statements[statement];
    if (filing) {
      const lineItems = convertProcessedSectionToCombinedLineItems(
        statementData.sections
      );
      if (lineItems) {
        res.status(200).json({ data: lineItems });
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
