export interface GrammarTestEntity {
  id?: number;
  title: string;
  mask?: string | null;
  last_review_date?: Date | null;
  review_count?: number | null;
  guid?: string | null;
}
