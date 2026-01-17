export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  likes: number;
  authorId: string;
  categoryId: string | null;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface Like {
  id: string;
  postId: string;
  visitorId: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  categories: Category[];
  posts: Post[];
  drafts: Draft[];
  likes: Like[];
}
