export default `

CREATE TABLE IF NOT EXISTS examples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence TEXT NOT NULL,
    translate TEXT,
    wordId INTEGER,
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
);

`;