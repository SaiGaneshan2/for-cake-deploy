// SQL Syntax Validator and Helper Functions

// Common SQL keywords for validation
export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
  'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'DATABASE',
  'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER', 'AND', 'OR', 'NOT',
  'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'DISTINCT', 'AS', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'INTERSECT', 'EXCEPT'
];

// Common SQL functions
export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'TRUNC', 'ABS', 'CEIL', 'FLOOR',
  'UPPER', 'LOWER', 'LENGTH', 'SUBSTRING', 'CONCAT', 'REPLACE', 'TRIM',
  'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'NOW', 'DATE', 'TIME'
];

// SQL syntax validation rules
export const validateSQLSyntax = (query) => {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  if (!query || query.trim().length === 0) {
    return { isValid: false, errors: ['Query cannot be empty'], warnings, suggestions };
  }

  const trimmedQuery = query.trim().toUpperCase();
  const originalQuery = query.trim();

  // Check for basic SELECT statement structure
  if (trimmedQuery.startsWith('SELECT')) {
    // Check for FROM clause
    if (!trimmedQuery.includes('FROM')) {
      errors.push('SELECT statement must include a FROM clause');
      suggestions.push('Add a FROM clause: SELECT * FROM table_name');
    }

    // Check for proper SELECT syntax
    if (trimmedQuery === 'SELECT' || trimmedQuery === 'SELECT FROM') {
      errors.push('SELECT statement is incomplete');
      suggestions.push('Complete your SELECT statement: SELECT column_name FROM table_name');
    }

    // Check for missing comma in column list
    const selectMatch = originalQuery.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) {
      const columns = selectMatch[1];
      if (columns.includes(',,') || columns.endsWith(',')) {
        errors.push('Invalid comma usage in SELECT clause');
        suggestions.push('Remove extra commas in your column list');
      }
    }
  }

  // Check for common syntax errors
  if (originalQuery.includes('  ')) {
    warnings.push('Multiple spaces detected');
    suggestions.push('Consider using single spaces for better readability');
  }

  // Check for missing semicolon (warning, not error)
  if (!originalQuery.endsWith(';') && originalQuery.length > 10) {
    warnings.push('Consider ending your query with a semicolon (;)');
  }

  // Check for potential SQL injection patterns (basic)
  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /TRUNCATE/i,
    /ALTER\s+TABLE/i
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(originalQuery)) {
      warnings.push('This query contains potentially dangerous operations');
      suggestions.push('Be careful with data modification operations');
    }
  });

  // Check for proper JOIN syntax
  if (trimmedQuery.includes('JOIN') && !trimmedQuery.includes('ON')) {
    errors.push('JOIN statement must include an ON clause');
    suggestions.push('Add ON clause: JOIN table2 ON table1.id = table2.id');
  }

  // Check for proper WHERE clause syntax
  if (trimmedQuery.includes('WHERE') && !trimmedQuery.includes('=') && !trimmedQuery.includes('LIKE') && !trimmedQuery.includes('IN')) {
    warnings.push('WHERE clause might be incomplete');
    suggestions.push('Add a condition: WHERE column_name = value');
  }

  // Check for proper GROUP BY syntax
  if (trimmedQuery.includes('GROUP BY') && !trimmedQuery.includes('SELECT')) {
    errors.push('GROUP BY can only be used with SELECT statements');
  }

  // Check for proper HAVING syntax
  if (trimmedQuery.includes('HAVING') && !trimmedQuery.includes('GROUP BY')) {
    errors.push('HAVING clause can only be used with GROUP BY');
    suggestions.push('Add GROUP BY clause before HAVING');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};

// Get query optimization tips
export const getOptimizationTips = (query) => {
  const tips = [];
  const trimmedQuery = query.trim().toUpperCase();

  // SELECT * optimization tip
  if (trimmedQuery.includes('SELECT *')) {
    tips.push({
      type: 'performance',
      message: 'Consider specifying column names instead of SELECT * for better performance',
      suggestion: 'Replace SELECT * with specific column names'
    });
  }

  // WHERE clause optimization
  if (trimmedQuery.includes('WHERE') && trimmedQuery.includes('OR')) {
    tips.push({
      type: 'performance',
      message: 'Multiple OR conditions can be slow. Consider using IN clause or indexing',
      suggestion: 'Use WHERE column IN (value1, value2) instead of multiple OR conditions'
    });
  }

  // ORDER BY optimization
  if (trimmedQuery.includes('ORDER BY') && !trimmedQuery.includes('LIMIT')) {
    tips.push({
      type: 'performance',
      message: 'ORDER BY without LIMIT can be expensive on large datasets',
      suggestion: 'Consider adding LIMIT clause to limit results'
    });
  }

  // JOIN optimization
  if (trimmedQuery.includes('JOIN') && trimmedQuery.includes('WHERE')) {
    tips.push({
      type: 'performance',
      message: 'Make sure JOIN conditions use indexed columns for better performance',
      suggestion: 'Ensure the columns in JOIN conditions are properly indexed'
    });
  }

  return tips;
};

// Format SQL query for better readability
export const formatSQL = (query) => {
  if (!query) return '';

  return query
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bON\b/gi, '\n  ON')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bLIMIT\b/gi, '\nLIMIT')
    .trim();
};

// Get SQL keyword suggestions
export const getKeywordSuggestions = (partialWord) => {
  if (!partialWord) return [];

  const upperPartial = partialWord.toUpperCase();
  
  const suggestions = [
    ...SQL_KEYWORDS.filter(keyword => keyword.startsWith(upperPartial)),
    ...SQL_FUNCTIONS.filter(func => func.startsWith(upperPartial))
  ];

  return suggestions.slice(0, 5); // Return top 5 suggestions
};
