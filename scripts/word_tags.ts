export default `

CREATE TABLE IF NOT EXISTS word_tags (
    wordId INTEGER,
    tagId INTEGER,
    PRIMARY KEY (wordId, tagId),
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

`;