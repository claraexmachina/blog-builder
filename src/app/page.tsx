import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/db';
import { Heart, Clock, Twitter, Github } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { siteConfig } from '@/config/site';
import ProfileEmoji from '@/components/ProfileEmoji';
import ProfileName from '@/components/ProfileName';
import ProfileBio from '@/components/ProfileBio';
import PixelRoom from '@/components/PixelRoom';
import NowPlaying from '@/components/NowPlaying';
import Thumbnail from '@/components/Thumbnail';

export const dynamic = 'force-dynamic';

// KST 기준 현재 날짜 가져오기
function getKSTDate() {
  const now = new Date();
  const kstOffset = 9 * 60; // KST is UTC+9
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (kstOffset * 60000));
}

export default async function HomePage() {
  const posts = (await getAllPosts(true)).slice(0, 5);
  const categories = await getAllCategories();
  const totalLikes = posts.reduce((acc, post) => acc + post.likes, 0);
  const today = getKSTDate();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Date Display */}
        <div className="text-center mb-8">
          <div className="today-box mx-auto">
            {format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">

          {/* Left Sidebar */}
          <div className="space-y-5 contents md:block">
            {/* Profile Widget */}
            <div className="widget-box order-1 md:order-none">
              <div className="widget-title">{siteConfig.widgetTitles.profile}</div>
              <div className="widget-content text-center">
                <div className="profile-frame w-20 h-20 mx-auto mb-4">
                  <div className="profile-inner w-full h-full flex items-center justify-center text-3xl">
                    <ProfileEmoji />
                  </div>
                </div>
                <p className="text-sm text-[var(--text-primary)] font-semibold mb-1">
                  <ProfileName />
                </p>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  <ProfileBio />
                </p>
                <div className="h-px bg-[var(--border-light)] my-4"></div>
                <div className="flex justify-center gap-6 text-xs">
                  <div className="text-center">
                    <div className="text-[var(--accent-warm)] font-semibold text-sm">{posts.length}</div>
                    <div className="text-[var(--text-muted)]">{siteConfig.profile.statsLabels.posts}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--accent-warm)] font-semibold text-sm">{totalLikes}</div>
                    <div className="text-[var(--text-muted)]">{siteConfig.profile.statsLabels.likes}</div>
                  </div>
                </div>
                {/* Social Links */}
                <div className="h-px bg-[var(--border-light)] my-4"></div>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://x.com/claraexmachina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-surface-alt)] border border-[var(--border-light)] hover:border-[var(--accent-warm)] hover:bg-[var(--accent-warm)] transition-all duration-200"
                    aria-label="Twitter (X)"
                  >
                    <Twitter className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-200 pointer-events-none" />
                  </a>
                  <a
                    href="https://github.com/claraexmachina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-surface-alt)] border border-[var(--border-light)] hover:border-[var(--icon-box-bg)] hover:bg-[var(--icon-box-bg)] transition-all duration-200"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--icon-box-text)] transition-colors duration-200 pointer-events-none" />
                  </a>
                </div>
              </div>
            </div>

            {/* Music/Mood Widget with YouTube - Last on mobile */}
            <div className="widget-box order-4 md:order-none">
              <div className="widget-title">{siteConfig.widgetTitles.nowPlaying}</div>
              <div className="widget-content">
                <NowPlaying />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-5 contents md:block">
            {/* Pixel Room Image */}
            <div className="widget-box order-2 md:order-none">
              <div className="widget-title">MY ROOM</div>
              <div className="widget-content p-0 overflow-hidden">
                <div className="relative w-full rounded-b-xl overflow-hidden">
                  <PixelRoom />
                </div>
              </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="widget-box order-3 md:order-none">
              <div className="widget-title">{siteConfig.widgetTitles.recentPosts}</div>
              <div className="widget-content">
                {posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.map((post) => {
                      const category = categories.find((c) => c.id === post.categoryId);
                      return (
                        <Link
                          key={post.id}
                          href={`/posts/${post.id}`}
                          className="pixel-card block p-4 group"
                        >
                          <div className="flex gap-4">
                            {/* Thumbnail */}
                            <Thumbnail
                              src={post.thumbnail}
                              alt={post.title}
                              size={64}
                              className="flex-shrink-0"
                            />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-warm)] transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                {category && (
                                  <span className="pixel-badge">{category.name}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Heart size={11} className="text-[var(--accent-warm)]" fill="currentColor" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} />
                                  {format(new Date(post.createdAt), 'MM.dd')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-[var(--text-muted)]">
                      {siteConfig.emptyState.message}
                    </p>
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="mt-5 text-center">
                    <Link href="/posts" className="pixel-btn-secondary pixel-btn inline-block">
                      {siteConfig.buttons.viewAllPosts}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mini-widget text-center order-5 md:order-none">
              <p className="text-xs text-[var(--text-muted)]">
                {siteConfig.footer.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
