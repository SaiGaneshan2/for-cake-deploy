// Quick Action Buttons Configuration
export const QUICK_ACTIONS = {
  // General SQL Concepts
  general: [
    {
      id: 'what-is-select',
      label: 'What is SELECT?',
      query: 'What is the SELECT statement in SQL and how do I use it?',
      icon: '🔍'
    },
    {
      id: 'what-is-where',
      label: 'What is WHERE?',
      query: 'Explain the WHERE clause in SQL with examples',
      icon: '🎯'
    },
    {
      id: 'what-is-join',
      label: 'What is JOIN?',
      query: 'Explain SQL JOINs (INNER, LEFT, RIGHT, FULL) with examples',
      icon: '🔗'
    },
    {
      id: 'what-is-group-by',
      label: 'What is GROUP BY?',
      query: 'Explain GROUP BY clause and aggregate functions in SQL',
      icon: '📊'
    },
    {
      id: 'what-is-order-by',
      label: 'What is ORDER BY?',
      query: 'Explain ORDER BY clause for sorting results in SQL',
      icon: '📈'
    }
  ],

  // Level-specific help based on game levels
  levelSpecific: {
    1: [
      {
        id: 'basic-select',
        label: 'Basic SELECT Help',
        query: 'Help me understand basic SELECT statements for Level 1',
        icon: '🌱'
      }
    ],
    2: [
      {
        id: 'where-clause-help',
        label: 'WHERE Clause Help',
        query: 'Help me understand WHERE clauses for Level 2',
        icon: '⚔️'
      }
    ],
    3: [
      {
        id: 'join-help',
        label: 'JOIN Help',
        query: 'Help me understand JOINs for Level 3',
        icon: '🏰'
      }
    ],
    4: [
      {
        id: 'like-operator',
        label: 'LIKE Operator',
        query: 'Explain the LIKE operator and wildcards in SQL',
        icon: '🛶'
      }
    ],
    5: [
      {
        id: 'multiple-conditions',
        label: 'Multiple Conditions',
        query: 'How to use multiple conditions with AND/OR in SQL',
        icon: '🗿'
      }
    ],
    6: [
      {
        id: 'group-by-help',
        label: 'GROUP BY Help',
        query: 'Help me understand GROUP BY and HAVING for Level 6',
        icon: '🐾'
      }
    ],
    7: [
      {
        id: 'complex-joins',
        label: 'Complex JOINs',
        query: 'Help me with complex JOIN operations for Level 7',
        icon: '🌋'
      }
    ],
    8: [
      {
        id: 'aggregate-functions',
        label: 'Aggregate Functions',
        query: 'Explain AVG, COUNT, SUM, MIN, MAX functions in SQL',
        icon: '🏁'
      }
    ],
    9: {
      id: 'update-statements',
      label: 'UPDATE Statements',
      query: 'Help me understand UPDATE statements for Level 9',
      icon: '🏯'
    },
    10: [
      {
        id: 'advanced-queries',
        label: 'Advanced Queries',
        query: 'Help me with advanced SQL queries for the final level',
        icon: '⚔️'
      }
    ]
  },

  // Common SQL Patterns
  patterns: [
    {
      id: 'select-all',
      label: 'SELECT * Pattern',
      query: 'Show me the SELECT * pattern and when to use it',
      icon: '⭐'
    },
    {
      id: 'filtering-data',
      label: 'Filtering Data',
      query: 'Show me common patterns for filtering data in SQL',
      icon: '🔍'
    },
    {
      id: 'sorting-results',
      label: 'Sorting Results',
      query: 'Show me how to sort query results in SQL',
      icon: '📊'
    },
    {
      id: 'counting-records',
      label: 'Counting Records',
      query: 'Show me how to count records in SQL',
      icon: '🔢'
    },
    {
      id: 'finding-max-min',
      label: 'Finding Max/Min',
      query: 'Show me how to find maximum and minimum values in SQL',
      icon: '📈'
    }
  ]
};

// Get quick actions based on current level
export const getQuickActionsForLevel = (level) => {
  const actions = [...QUICK_ACTIONS.general, ...QUICK_ACTIONS.patterns];
  
  if (QUICK_ACTIONS.levelSpecific[level]) {
    actions.unshift(...QUICK_ACTIONS.levelSpecific[level]);
  }
  
  return actions;
};

// Get all quick actions
export const getAllQuickActions = () => {
  return [
    ...QUICK_ACTIONS.general,
    ...QUICK_ACTIONS.patterns
  ];
};
