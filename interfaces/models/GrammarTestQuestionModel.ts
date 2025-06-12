export interface GrammarTestQuestionModel {
  id?: number;
  sentence: string;
  translation: string;
  answers: string[];
  correctAnswer: string;
  testId: number;
}
