export type Accouncement = {
  id: number;
  title: string;
  content?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
};

export type Awareness = {
  id: number;
  title: string;
  description?: string;
  attachments?: {
    title: string;
    content?: string;
    image?: string;
  }[];
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  main_image: string;
  other_images: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Slider = {
  type: "image" | "post" | "url";
  image: string;
  post_id?: number;
  url?: string;
  post?: Post;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  centers: number | null;
  users: number | null;
  patients: number | null;
  appointments: number | null;
  doctors: number | null;
  orders: number | null;
};

export type LaravelPage<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  per_page: number;
  to: number | null;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
};

export type Center = {
  id: number;
  name: string;
  phone: string;
  alt_phone?: string;
  street?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  schedules?: Schedule[];
};

export type Dcotor = {
  id: number;
  name: string;
  phone: string;
  center_id: number;
};

export type Schedule = {
  id: number;
  center_id: number;
  day: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type PaginatedPosts = {
  current_page: number;
  data: Post[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
};
