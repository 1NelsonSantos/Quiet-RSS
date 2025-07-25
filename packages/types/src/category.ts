export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  order: number;
  feedCount: number;
  unreadCount: number;
}

export interface CategoryCreatePayload {
  name: string;
  color?: string;
  icon?: string;
}

export interface CategoryUpdatePayload {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  order?: number;
}
