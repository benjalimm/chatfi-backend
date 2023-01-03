export const GET_DOCUMENT_TYPE_PROMPT = `
    Income statement = INCOME_STATEMENT
    Balance sheet = BALANCE_SHEET
    Cash flow statement = CASH_FLOW_STATEMENT
    Shareholder equity / stockholder equiter = SHAREHOLDERS_EQUITY_STATEMENT
    Statement of operations = STATEMENT_OPERATIONS
    Revenue in notes to financial statement = REVENUE_NOTES
    

    Above are the financial statements that are available for company X. Based on the following query, which financial statement should be queried?

    Format the answers in an array within a JSON with the answer array in a field called documentTypes

    Query: 

    `

  export const INFER_ANSWER_PROMPT = `
  
  Above is a potentially a list of financial statements in JSON. Based on the following information, execute the following query. 

  Query: 

  `