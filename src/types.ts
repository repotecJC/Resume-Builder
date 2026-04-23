export interface ContactItem {
  id: string;
  icon: string;
  text: string;
  url: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  contactItems?: ContactItem[];
  summaryAlign?: 'left' | 'center' | 'right' | 'justify';
  summaryWidth?: number;
  photo?: string;
  photoPosition?: 'left' | 'right';
}

export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export interface TagItem {
  id: string;
  text: string;
}

export interface Block {
  id: string;
  title: string;
  icon?: string;
  type: 'list' | 'tags';
  items: any[]; // ListItem[] | TagItem[]
}

export interface ResumeData {
  themeColor: string;
  enableAnimation: boolean;
  profile: Profile;
  blockOrder: string[];
  blocks: Record<string, Block>;
  liveId?: string;
  updateToken?: string;
}
