export default `

CREATE TABLE IF NOT EXISTS set_words (
    setId INTEGER,
    wordId INTEGER,
    PRIMARY KEY (setId, wordId),    
    FOREIGN KEY (setId) REFERENCES sets(id) ON DELETE CASCADE,
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
);

`;