export interface MovieNews {
  _id: string;
  title: string;
  slug: { current: string };
  poster?: {
    asset: { _ref: string };
    hotspot?: { x: number; y: number };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialNews?: any[];
  summaryPreview?: string;
  youtubeReactions?: string;
  telegramLink: string;
  _createdAt?: string;
}
