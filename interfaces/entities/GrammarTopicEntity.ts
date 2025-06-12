export interface GrammarTopicEntity {
  id?: number;
  topicId: number | null;
  language: string;
  title: string;
  description?: string;
  content: string;
  guid?: string | null;
}

export type LanguageCode = "en" | "uk" | string;
