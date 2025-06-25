export default `

CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    word TEXT NOT NULL,
    transcription TEXT,
    translation TEXT,
    explanation TEXT,
    definition TEXT,
    partOfSpeech TEXT NOT NULL,
    language TEXT NULL DEFAULT 'en',
    level TEXT NOT NULL DEFAULT 'A1',
    isIrregular BOOLEAN DEFAULT FALSE,
    audio BLOB,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    rate REAL NOT NULL,
    createdAt TEXT NULL,
    updatedAt TEXT NULL,
    dictionaryId INTEGER,
    FOREIGN KEY (dictionaryId) REFERENCES dictionaries(id) ON DELETE CASCADE
);

`;