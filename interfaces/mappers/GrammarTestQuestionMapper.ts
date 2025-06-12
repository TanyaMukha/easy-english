import { GrammarTestQuestionEntity } from "../entities/GrammarTestQuestionEntity";
import { GrammarTestQuestionModel } from "../models/GrammarTestQuestionModel";

/**
 * Helper function to handle single question conversion when loading from database
 * Safely parses the answers JSON string
 */
export const mapGrammarTestQuestionEntityToModel = (
  question: GrammarTestQuestionEntity,
): GrammarTestQuestionModel => {
  try {
    return {
      ...question,
      answers: JSON.parse(question.answers),
    };
  } catch (error) {
    console.error(
      `Failed to parse answers for question ${question.id}:`,
      error,
    );
    // Fallback to empty array if parsing fails
    return {
      ...question,
      answers: [],
    };
  }
};

/**
 * Helper function to safely stringify answers when saving to database
 */
export const mapGrammarTestQuestionModelToEntity = (
  question: GrammarTestQuestionModel,
): GrammarTestQuestionEntity => {
  try {
    return {
      ...question,
      answers: Array.isArray(question.answers)
        ? JSON.stringify(question.answers)
        : JSON.stringify([]), // Ensure we always have a valid JSON string
    };
  } catch (error) {
    console.error(
      `Failed to stringify answers for question ${question.id}:`,
      error,
    );
    // Fallback to empty array JSON string if stringification fails
    return {
      ...question,
      answers: "[]",
    };
  }
};
