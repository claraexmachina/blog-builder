import { kv } from '@vercel/kv';
import { Database, User, Category, Post, Draft, Like } from './types';
import bcrypt from 'bcryptjs';

const DB_KEY = 'blog-database';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getDefaultDb(): Database {
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'password123', 10);
  return {
    users: [
      {
        id: 'admin-user',
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      },
    ],
    categories: [
      { id: 'cat-daily', name: '일상', slug: 'daily' },
      { id: 'cat-thoughts', name: '생각', slug: 'thoughts' },
      { id: 'cat-journal', name: '일기', slug: 'journal' },
      { id: 'cat-tech', name: '기술', slug: 'tech' },
    ],
    posts: [],
    drafts: [],
    likes: [],
  };
}

async function readDb(): Promise<Database> {
  try {
    const data = await kv.get<Database>(DB_KEY);
    if (!data) {
      const defaultDb = getDefaultDb();
      await writeDb(defaultDb);
      return defaultDb;
    }
    return data;
  } catch {
    const defaultDb = getDefaultDb();
    return defaultDb;
  }
}

async function writeDb(data: Database): Promise<void> {
  await kv.set(DB_KEY, data);
}

// User functions
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await readDb();
  return db.users.find((u) => u.username === username);
}

export function validatePassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password);
}

// Category functions
export async function getAllCategories(): Promise<Category[]> {
  const db = await readDb();
  return db.categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await readDb();
  return db.categories.find((c) => c.slug === slug);
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  const db = await readDb();
  const category: Category = {
    id: generateId(),
    name,
    slug,
  };
  db.categories.push(category);
  await writeDb(db);
  return category;
}

// Post functions
export async function getAllPosts(publishedOnly = true): Promise<Post[]> {
  const db = await readDb();
  let posts = db.posts;
  if (publishedOnly) {
    posts = posts.filter((p) => p.published);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPostsByCategory(categoryId: string, publishedOnly = true): Promise<Post[]> {
  const db = await readDb();
  let posts = db.posts.filter((p) => p.categoryId === categoryId);
  if (publishedOnly) {
    posts = posts.filter((p) => p.published);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const db = await readDb();
  return db.posts.find((p) => p.id === id);
}

export async function createPost(data: {
  title: string;
  content: string;
  excerpt: string;
  thumbnail?: string | null;
  categoryId?: string | null;
  authorId: string;
  published?: boolean;
}): Promise<Post> {
  const db = await readDb();
  const now = new Date().toISOString();
  const post: Post = {
    id: generateId(),
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    thumbnail: data.thumbnail || null,
    categoryId: data.categoryId || null,
    authorId: data.authorId,
    published: data.published ?? false,
    likes: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.posts.push(post);
  await writeDb(db);
  return post;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, 'id' | 'createdAt' | 'authorId'>>
): Promise<Post | undefined> {
  const db = await readDb();
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  db.posts[index] = {
    ...db.posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  return db.posts[index];
}

export async function deletePost(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  db.posts.splice(index, 1);
  db.likes = db.likes.filter((l) => l.postId !== id);
  await writeDb(db);
  return true;
}

// Draft functions
export async function getAllDrafts(authorId: string): Promise<Draft[]> {
  const db = await readDb();
  return db.drafts
    .filter((d) => d.authorId === authorId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getDraftById(id: string): Promise<Draft | undefined> {
  const db = await readDb();
  return db.drafts.find((d) => d.id === id);
}

export async function createDraft(data: {
  title: string;
  content: string;
  thumbnail?: string | null;
  categoryId?: string | null;
  authorId: string;
}): Promise<Draft> {
  const db = await readDb();
  const now = new Date().toISOString();
  const draft: Draft = {
    id: generateId(),
    title: data.title,
    content: data.content,
    thumbnail: data.thumbnail || null,
    categoryId: data.categoryId || null,
    authorId: data.authorId,
    createdAt: now,
    updatedAt: now,
  };
  db.drafts.push(draft);
  await writeDb(db);
  return draft;
}

export async function updateDraft(
  id: string,
  data: Partial<Omit<Draft, 'id' | 'createdAt' | 'authorId'>>
): Promise<Draft | undefined> {
  const db = await readDb();
  const index = db.drafts.findIndex((d) => d.id === id);
  if (index === -1) return undefined;

  db.drafts[index] = {
    ...db.drafts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  return db.drafts[index];
}

export async function deleteDraft(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.drafts.findIndex((d) => d.id === id);
  if (index === -1) return false;

  db.drafts.splice(index, 1);
  await writeDb(db);
  return true;
}

// Like functions
export async function getLikeCount(postId: string): Promise<number> {
  const db = await readDb();
  return db.likes.filter((l) => l.postId === postId).length;
}

export async function hasLiked(postId: string, visitorId: string): Promise<boolean> {
  const db = await readDb();
  return db.likes.some((l) => l.postId === postId && l.visitorId === visitorId);
}

export async function addLike(postId: string, visitorId: string): Promise<boolean> {
  const db = await readDb();
  const alreadyLiked = db.likes.some((l) => l.postId === postId && l.visitorId === visitorId);
  if (alreadyLiked) return false;

  const like: Like = {
    id: generateId(),
    postId,
    visitorId,
    createdAt: new Date().toISOString(),
  };
  db.likes.push(like);

  const postIndex = db.posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    db.posts[postIndex].likes = db.likes.filter((l) => l.postId === postId).length;
  }

  await writeDb(db);
  return true;
}

export async function removeLike(postId: string, visitorId: string): Promise<boolean> {
  const db = await readDb();
  const index = db.likes.findIndex((l) => l.postId === postId && l.visitorId === visitorId);
  if (index === -1) return false;

  db.likes.splice(index, 1);

  const postIndex = db.posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    db.posts[postIndex].likes = db.likes.filter((l) => l.postId === postId).length;
  }

  await writeDb(db);
  return true;
}

export async function initDb(): Promise<void> {
  await readDb();
}
