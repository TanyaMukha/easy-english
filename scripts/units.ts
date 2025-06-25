export default `

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lastReviewDate TEXT,
    reviewCount INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

`;