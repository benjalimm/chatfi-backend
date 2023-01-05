export const GET_DOCUMENT_TYPE_PROMPT = `
    Income statement = INCOME_STATEMENT
    Balance sheet = BALANCE_SHEET
    Cash flow statement = CASH_FLOW_STATEMENT
    Shareholder equity / stockholder equiter = SHAREHOLDERS_EQUITY_STATEMENT
    Statement of operations = STATEMENT_OPERATIONS
    Revenue in notes to financial statement = REVENUE_NOTES
    Info on acquisitions in notes to financial statement = ACQUISITION_NOTES
    

    Above are the financial statements that are available for company X. Based on the following query, which financial statement should be queried?

    Format the answers with the following JSON format:
    {
      "documentTypes": string[]
    }

    Query: 

    `

  export const INFER_ANSWER_PROMPT = `
  
  Above is a potentially a list of financial statements in JSON. Based on the following information, execute the following query. 

  Query: 

  `

  export const PRECAUTIONS_PROMPT = 
  `

  Attempt to be detailed when providing an answer. 
  Specify numbers and dates if possible. Do not answer with a SQL query unless explicitly asked to do so.

  If the query is not possible given the provided information, list what information is required to answer the query.

  Simply extract the pertinent values, display them and tell us which document you extracted them from. When referring to the documents, do not refer to them as JSONs, but simply refer to them as the title of the document.
  
  `