import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('articles');
  const sideQuests = await getCollection('side-quests');

  const allPosts = [
    ...articles.map((post) => ({ ...post, urlPrefix: 'articles' })),
    ...sideQuests.map((post) => ({ ...post, urlPrefix: 'side-quests' })),
  ].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Learn It Anyway',
    description: "A curious engineer's notebook on the internet.",
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.urlPrefix}/${post.id}/`,
    })),
  });
}
