export default `

CREATE TABLE IF NOT EXISTS study_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    dialogue TEXT,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    rate REAL NOT NULL,
    createdAt TEXT NULL,
    updatedAt TEXT NULL,
    unitId INTEGER,
    FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
);

`;