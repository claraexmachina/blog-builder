import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getAllCategories } from '@/lib/db';
import { Heart, Folder, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const posts = (await getAllPosts(true)).slice(0, 5);
  const categories = await getAllCategories();
  const totalLikes = posts.reduce((acc, post) => acc + post.likes, 0);

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Mini Homepage Title */}
        <div className="text-center mb-6">
          <h1 className="text-lg text-[var(--kuromi-dark-purple)] mb-1">
            <span className="pixel-star">★</span> {siteConfig.title} <span className="pixel-star">★</span>
          </h1>
          <div className="today-box mx-auto">
            TODAY <span>{Math.floor(Math.random() * 50) + 10}</span> | TOTAL <span>{Math.floor(Math.random() * 5000) + 1000}</span>
          </div>
        </div>

        {/* Main Layout - Cyworld Style */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* Profile Widget */}
            <div className="widget-box">
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

            {/* Categories Widget */}
            <div className="widget-box">
              <div className="widget-title">{siteConfig.widgetTitles.category}</div>
              <div className="widget-content">
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex items-center gap-2 text-sm hover:text-[var(--kuromi-pink)] transition-colors"
                      >
                        <Folder size={12} className="text-[var(--kuromi-lavender)]" />
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Music/Mood Widget */}
            <div className="widget-box">
              <div className="widget-title">{siteConfig.widgetTitles.nowPlaying}</div>
              <div className="widget-content">
                <div className="mini-widget">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[var(--kuromi-dark-purple)] flex items-center justify-center text-white text-xs">
                      ♪
                    </div>
                    <div className="text-xs">
                      <p className="text-[var(--kuromi-dark-purple)] font-bold">{siteConfig.nowPlaying.title}</p>
                      <p className="text-[var(--text-muted)]">{siteConfig.nowPlaying.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4">
            {/* Room Display */}
            <div className="room-container h-64 md:h-80 flex items-center justify-center">
              <div className="text-center z-10 relative">
                <p className="text-[var(--kuromi-light-lavender)] text-sm mb-2">
                  {siteConfig.room.title}
                </p>
                <p className="text-[var(--kuromi-lavender)] text-xs mb-4 opacity-70">
                  {siteConfig.room.subtitle}
                </p>
                {/* Decorative elements */}
                <div className="flex justify-center gap-6 text-2xl opacity-70">
                  {siteConfig.room.decorations.map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}
                </div>
                <p className="text-[var(--text-muted)] text-xs mt-4">
                  {siteConfig.room.placeholder}
                </p>
              </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="widget-box">
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
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      {siteConfig.emptyState.message} <span className="pixel-heart">♡</span>
                    </p>
                    <Link href="/write" className="pixel-btn inline-block">
                      {siteConfig.emptyState.buttonText}
                    </Link>
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
            <div className="mini-widget text-center">
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
