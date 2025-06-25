import createDictionariesTable from "../scripts/dictionaries";
import createExamplesTable from "../scripts/examples";
import createGrammarTestsTable from "../scripts/grammar_tests";
import createGrammarTopicTestsTable from "../scripts/grammar_topic_tests";
import createGrammarTopicsTable from "../scripts/grammar_topics";
import createIrregularFormsTable from "../scripts/irregular_forms";
import createSetWordsTable from "../scripts/set_words";
import createSetsTable from "../scripts/sets";
import createStudyCardItemsTable from "../scripts/study_card_items";
import createStudyCardsTable from "../scripts/study_cards";
import createTagsTable from "../scripts/tags";
import createTestCardsTable from "../scripts/test_cards";
import createUnitsTable from "../scripts/units";
import createWordTagsTable from "../scripts/word_tags";
import createWordsTable from "../scripts/words";

export const createTableScripts = [
  createDictionariesTable,
  createSetsTable,
  createUnitsTable,
  createTagsTable,
  createWordsTable,
  createExamplesTable,
  createWordTagsTable,
  createIrregularFormsTable,
  createSetWordsTable,
  createStudyCardsTable,
  createStudyCardItemsTable,
  createGrammarTestsTable,
  createGrammarTopicsTable,
  createGrammarTopicTestsTable,
  createTestCardsTable,
];

export default createTableScripts;
