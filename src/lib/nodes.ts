export type NodeType = "subject" | "chapter" | "algorithm";

export interface ContentNode {
  children: ContentNode[];
  id: string;
  parentId: string | null;
  type: NodeType;
  slug: string;
  title: string;
  orderIndex: number;
  hasContent?: boolean;
}