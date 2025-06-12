export interface GrammarTestQuestionEntity {
  id?: number;
  sentence: string;
  translation: string;
  answers: string;
  correctAnswer: string;
  testId: number;
}
