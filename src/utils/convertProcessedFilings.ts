import {
  ProcessedFilingData,
  ProcessedSectionsKeyValueStore,
  ProcessedStatementsKeyValueStore
} from '../schema/sec/FilingData';
import { LineItem } from '../schema/sec/TableOfLineItems';

export function convertProcessedSectionToCombinedLineItems(
  sectionsData: ProcessedSectionsKeyValueStore
): { [key: string]: LineItem[] } {
  const combinedLineItems: { [key: string]: LineItem[] } = {};
  for (const section in sectionsData) {
    const sectionData = sectionsData[section];
    if (sectionData.filetype === 'json') {
      const data = JSON.parse(sectionData.data)[section];
      combinedLineItems[section] = data;
    }
  }
  return combinedLineItems;
}

export function convertProcessedStatementToCombinedLineItems(
  statementData: ProcessedStatementsKeyValueStore
) {
  const listOfCombinedLineItems: {
    [key: string]: { [key: string]: LineItem[] };
  } = {};

  for (const statement in statementData) {
    const statementSections = statementData[statement].sections;
    const statementCombinedLineItems =
      convertProcessedSectionToCombinedLineItems(statementSections);
    listOfCombinedLineItems[statement] = statementCombinedLineItems;
  }
  return listOfCombinedLineItems;
}
