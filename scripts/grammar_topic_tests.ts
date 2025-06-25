export default `

CREATE TABLE IF NOT EXISTS grammar_topic_tests (
    topicId INTEGER,
    testId INTEGER,
    PRIMARY KEY (topicId, testId),
    FOREIGN KEY (topicId) REFERENCES grammar_topics(id) ON DELETE CASCADE,
    FOREIGN KEY (testId) REFERENCES grammar_tests(id) ON DELETE CASCADE
);

`;