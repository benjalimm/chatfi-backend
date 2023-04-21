import {
  ProcessedSectionsKeyValueStore,
  ProcessedStatementsKeyValueStore
} from '../schema/sec/FilingData';
import { LineItem } from '../schema/sec/TableOfLineItems';
import {
  isArrayOfLineItems,
  isLineItem
} from '../schema/sec/TableOfLineItems.guard';

export function convertProcessedSectionToCombinedLineItems(
  sectionsData: ProcessedSectionsKeyValueStore
): { [key: string]: LineItem[] } {
  const combinedLineItems: { [key: string]: LineItem[] } = {};
  for (const section in sectionsData) {
    const sectionData = sectionsData[section];
    if (sectionData.fileType === 'json') {
      const data = JSON.parse(sectionData.jsonData)[section];

      if (isArrayOfLineItems(data)) {
        combinedLineItems[section] = data;
      } else if (isLineItem(data)) {
        combinedLineItems[section] = [data];
      }
    }
  }
  return combinedLineItems;
}

export function convertProcessedSectionToCombinedHtml(
  sectionsData: ProcessedSectionsKeyValueStore
): string {
  let combinedHtml = '';
  for (const section in sectionsData) {
    const sectionData = sectionsData[section];
    if (sectionData.fileType === 'html') {
      combinedHtml += sectionData.htmlData;
    }
  }
  return combinedHtml;
}

export function convertProcessedSectionToCombinedTextOrLineItems(
  sectionsData: ProcessedSectionsKeyValueStore
): string | { [key: string]: LineItem[] } {
  // 1. Determine whether the section is text or line items by looking at the first object in the sectionsData -> I know this is messy.
  for (const section in sectionsData) {
    const sectionData = sectionsData[section];
    if (sectionData.fileType === 'json') {
      // 2. If line items, convert to line items
      return convertProcessedSectionToCombinedLineItems(sectionsData);
    } else {
      // 3. If text, convert to text
      return convertProcessedSectionToCombinedHtml(sectionsData);
    }
  }
  throw new Error('No section data found');
}

// NOTE: REASSESS THIS FUNCTION - HOW TO DISTINGUISH BETWEEN TEXT AND LINEITEM?
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
