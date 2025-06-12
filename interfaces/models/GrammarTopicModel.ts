import { GrammarTestModel } from "./GrammarTestModel";
import { GrammarTopicEntity } from "../entities/GrammarTopicEntity";

export interface GrammarTopicModel extends GrammarTopicEntity {
  // id?: number;
  // topicId: number | null;
  // language: string;
  // title: string;
  // description?: string;
  // content: string;
  // guid?: string | null;
  tests?: GrammarTestModel[];
}

export type LanguageCode = "en" | "uk" | string;
