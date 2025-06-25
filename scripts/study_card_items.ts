export default `

CREATE TABLE IF NOT EXISTS study_card_items (
    cardId INTEGER,
    wordId INTEGER,
    PRIMARY KEY (cardId, wordId),
    FOREIGN KEY (cardId) REFERENCES study_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (wordId) REFERENCES words(id) ON DELETE CASCADE
);

`;