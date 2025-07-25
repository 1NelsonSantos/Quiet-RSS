export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  refreshInterval: number; // in minutes
  notificationsEnabled: boolean;
  markAsReadOnScroll: boolean;
  showUnreadOnly: boolean;
}

export interface ReadingPreferences {
  fontFamily: string;
  lineHeight: number;
  maxWidth?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  newArticles: boolean;
  feedErrors: boolean;
  quietHours?: {
    start: string; // in HH:MM format
    end: string;
  };
}
