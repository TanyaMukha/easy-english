export default `

CREATE TABLE IF NOT EXISTS irregular_forms (
    firstFormId INTEGER,
    secondFormId INTEGER,
    thirdFormId INTEGER,
    PRIMARY KEY (firstFormId, secondFormId, thirdFormId),
    FOREIGN KEY (firstFormId) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (secondFormId) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (thirdFormId) REFERENCES words(id) ON DELETE CASCADE
);

`;