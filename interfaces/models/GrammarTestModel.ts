import { GrammarTestEntity } from "../entities/GrammarTestEntity";
import { GrammarTestQuestionModel } from "./GrammarTestQuestionModel";

export interface GrammarTestModel extends GrammarTestEntity {
  // id?: number;
  // title: string;
  // mask?: string | null;
  // last_review_date?: Date | null;
  // review_count?: number | null;
  // guid?: string | null;
  questions?: GrammarTestQuestionModel[];
  topics?: GrammarTestModel[];
}


