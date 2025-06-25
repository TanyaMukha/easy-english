export default `

CREATE TABLE IF NOT EXISTS grammar_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    rate REAL NOT NULL,
    createdAt TEXT NULL,
    updatedAt TEXT NULL,
);

`;