export interface ZenMessage {
  id: string;
  content: string;
  category: "wisdom" | "mindfulness" | "dharma" | "practice";
  source?: string;
  timestamp: string; // ISO string
  tags?: string[];
}
