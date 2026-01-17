import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getAllCategories } from '@/lib/db';
import { Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { siteConfig } from '@/config/site';

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
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Mini Homepage Title */}
        <div className="text-center mb-6">
          <h1 className="text-lg text-[var(--kuromi-dark-purple)] mb-1">
            <span className="pixel-star">★</span> {siteConfig.title} <span className="pixel-star">★</span>
          </h1>
          <div className="today-box mx-auto">
            {format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </div>
        </div>

        {/* Main Layout - Cyworld Style */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

          {/* Left Sidebar */}
          <div className="space-y-4 contents lg:block">
            {/* Profile Widget */}
            <div className="widget-box order-1 lg:order-none">
              <div className="widget-title">{siteConfig.widgetTitles.profile}</div>
              <div className="widget-content text-center">
                <div className="profile-frame w-20 h-20 mx-auto mb-3">
                  <div className="profile-inner w-full h-full flex items-center justify-center text-3xl">
                    {siteConfig.profile.emoji}
                  </div>
                </div>
                <p className="text-sm text-[var(--kuromi-dark-purple)] font-bold mb-1">
                  {siteConfig.profile.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {siteConfig.profile.bio}
                </p>
                <div className="pixel-divider"></div>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-[var(--kuromi-pink)] font-bold">{posts.length}</div>
                    <div className="text-[var(--text-muted)]">{siteConfig.profile.statsLabels.posts}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--kuromi-pink)] font-bold">{totalLikes}</div>
                    <div className="text-[var(--text-muted)]">{siteConfig.profile.statsLabels.likes}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Music/Mood Widget with YouTube - Last on mobile */}
            <div className="widget-box order-4 lg:order-none">
              <div className="widget-title">{siteConfig.widgetTitles.nowPlaying}</div>
              <div className="widget-content">
                <div className="mini-widget">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[var(--kuromi-dark-purple)] flex items-center justify-center text-white text-xs">
                      ♪
                    </div>
                    <div className="text-xs">
                      <p className="text-[var(--kuromi-dark-purple)] font-bold">{siteConfig.nowPlaying.title}</p>
                      <p className="text-[var(--text-muted)]">{siteConfig.nowPlaying.artist}</p>
                    </div>
                  </div>
                  <div className="aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${siteConfig.nowPlaying.youtubeId}`}
                      title="Now Playing"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-2 border-[var(--kuromi-lavender)]"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4 contents lg:block">
            {/* Pixel Room Image */}
            <div className="widget-box order-2 lg:order-none">
              <div className="widget-title">MY ROOM</div>
              <div className="widget-content p-0 overflow-hidden">
                <div className="relative w-full">
                  <Image
                    src="/images/pixel-room.png"
                    alt="My Pixel Room"
                    width={1280}
                    height={853}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="widget-box order-3 lg:order-none">
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
                          className="pixel-card block p-3 group"
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 flex-shrink-0 bg-[var(--kuromi-cream)] border-2 border-[var(--kuromi-lavender)] flex items-center justify-center overflow-hidden">
                              {post.thumbnail ? (
                                <Image
                                  src={post.thumbnail}
                                  alt={post.title}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-[var(--kuromi-lavender)] text-xl">✦</span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-[var(--kuromi-dark-purple)] truncate group-hover:text-[var(--kuromi-pink)] transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                {category && (
                                  <span className="pixel-badge">{category.name}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Heart size={10} className="text-[var(--kuromi-pink)]" fill="currentColor" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
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
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--text-muted)]">
                      {siteConfig.emptyState.message} <span className="pixel-heart">♡</span>
                    </p>
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link href="/posts" className="pixel-btn-secondary pixel-btn inline-block">
                      {siteConfig.buttons.viewAllPosts}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Guestbook Style Footer */}
            <div className="mini-widget text-center order-5 lg:order-none">
              <p className="text-xs text-[var(--text-muted)]">
                <span className="pixel-star">✧</span> {siteConfig.footer.message} <span className="pixel-star">✧</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
