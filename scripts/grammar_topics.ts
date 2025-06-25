export default `

CREATE TABLE IF NOT EXISTS grammar_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    topicId INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    createdAt TEXT NULL,
    updatedAt TEXT NULL,
    FOREIGN KEY (topicId) REFERENCES grammar_topics(id) ON DELETE CASCADE
);

`;