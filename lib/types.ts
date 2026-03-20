export type Category = "wisdom" | "mindfulness" | "dharma" | "practice";

export interface ZenMessageMeta {
  id: string;
  category: Category;
  timestamp: string; // ISO string
  tags?: string[];
}

export interface ZenMessage extends ZenMessageMeta {
  content: string;
  source?: string;
}
