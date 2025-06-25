export default `

CREATE TABLE IF NOT EXISTS test_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    testType TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    text TEXT,
    mask TEXT,
    options TEXT,
    correctAnswers TEXT NOT NULL,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    rate REAL NOT NULL,
    createdAt TEXT NULL,
    updatedAt TEXT NULL,
    testId INTEGER,
    FOREIGN KEY (testId) REFERENCES grammar_tests(id) ON DELETE CASCADE
);

`;