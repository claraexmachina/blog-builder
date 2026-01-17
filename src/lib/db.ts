import fs from 'fs';
import path from 'path';
import { Database, User, Category, Post, Draft, Like } from './types';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

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

function readDb(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDb = getDefaultDb();
      writeDb(defaultDb);
      return defaultDb;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    const defaultDb = getDefaultDb();
    writeDb(defaultDb);
    return defaultDb;
  }
}

function writeDb(data: Database): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// User functions
export function getUserByUsername(username: string): User | undefined {
  const db = readDb();
  return db.users.find((u) => u.username === username);
}

export function validatePassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password);
}

// Category functions
export function getAllCategories(): Category[] {
  const db = readDb();
  return db.categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const db = readDb();
  return db.categories.find((c) => c.slug === slug);
}

export function createCategory(name: string, slug: string): Category {
  const db = readDb();
  const category: Category = {
    id: generateId(),
    name,
    slug,
  };
  db.categories.push(category);
  writeDb(db);
  return category;
}

// Post functions
export function getAllPosts(publishedOnly = true): Post[] {
  const db = readDb();
  let posts = db.posts;
  if (publishedOnly) {
    posts = posts.filter((p) => p.published);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPostsByCategory(categoryId: string, publishedOnly = true): Post[] {
  const db = readDb();
  let posts = db.posts.filter((p) => p.categoryId === categoryId);
  if (publishedOnly) {
    posts = posts.filter((p) => p.published);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPostById(id: string): Post | undefined {
  const db = readDb();
  return db.posts.find((p) => p.id === id);
}

export function createPost(data: {
  title: string;
  content: string;
  excerpt: string;
  thumbnail?: string | null;
  categoryId?: string | null;
  authorId: string;
  published?: boolean;
}): Post {
  const db = readDb();
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
  writeDb(db);
  return post;
}

export function updatePost(
  id: string,
  data: Partial<Omit<Post, 'id' | 'createdAt' | 'authorId'>>
): Post | undefined {
  const db = readDb();
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  db.posts[index] = {
    ...db.posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.posts[index];
}

export function deletePost(id: string): boolean {
  const db = readDb();
  const index = db.posts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  db.posts.splice(index, 1);
  // Also delete associated likes
  db.likes = db.likes.filter((l) => l.postId !== id);
  writeDb(db);
  return true;
}

// Draft functions
export function getAllDrafts(authorId: string): Draft[] {
  const db = readDb();
  return db.drafts
    .filter((d) => d.authorId === authorId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getDraftById(id: string): Draft | undefined {
  const db = readDb();
  return db.drafts.find((d) => d.id === id);
}

export function createDraft(data: {
  title: string;
  content: string;
  thumbnail?: string | null;
  categoryId?: string | null;
  authorId: string;
}): Draft {
  const db = readDb();
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
  writeDb(db);
  return draft;
}

export function updateDraft(
  id: string,
  data: Partial<Omit<Draft, 'id' | 'createdAt' | 'authorId'>>
): Draft | undefined {
  const db = readDb();
  const index = db.drafts.findIndex((d) => d.id === id);
  if (index === -1) return undefined;

  db.drafts[index] = {
    ...db.drafts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.drafts[index];
}

export function deleteDraft(id: string): boolean {
  const db = readDb();
  const index = db.drafts.findIndex((d) => d.id === id);
  if (index === -1) return false;

  db.drafts.splice(index, 1);
  writeDb(db);
  return true;
}

// Like functions
export function getLikeCount(postId: string): number {
  const db = readDb();
  return db.likes.filter((l) => l.postId === postId).length;
}

export function hasLiked(postId: string, visitorId: string): boolean {
  const db = readDb();
  return db.likes.some((l) => l.postId === postId && l.visitorId === visitorId);
}

export function addLike(postId: string, visitorId: string): boolean {
  const db = readDb();
  if (hasLiked(postId, visitorId)) return false;

  const like: Like = {
    id: generateId(),
    postId,
    visitorId,
    createdAt: new Date().toISOString(),
  };
  db.likes.push(like);

  // Update post likes count
  const postIndex = db.posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    db.posts[postIndex].likes = db.likes.filter((l) => l.postId === postId).length;
  }

  writeDb(db);
  return true;
}

export function removeLike(postId: string, visitorId: string): boolean {
  const db = readDb();
  const index = db.likes.findIndex((l) => l.postId === postId && l.visitorId === visitorId);
  if (index === -1) return false;

  db.likes.splice(index, 1);

  // Update post likes count
  const postIndex = db.posts.findIndex((p) => p.id === postId);
  if (postIndex !== -1) {
    db.posts[postIndex].likes = db.likes.filter((l) => l.postId === postId).length;
  }

  writeDb(db);
  return true;
}

// Initialize database
export function initDb(): void {
  readDb();
}
