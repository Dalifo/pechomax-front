import { Article, ServiceResult } from '../types/domain';

// TODO(backend): no article/CMS endpoint exists in pechomax-backend/apps/server.
// Deprecated fallback kept so the secondary article screen remains usable until a real endpoint is added.
const delay = 160;

const fallbackArticles: Article[] = [
  {
    id: 'fallback-article-1',
    title: 'Les meilleurs leurres pour le brochet',
    category: 'Materiel',
    author: 'Equipe PechoMax',
    readTime: '5 min',
    dateLabel: '15 Jan 2026',
    excerpt: 'Selection simple de leurres efficaces pour pecher le brochet avec methode.',
    views: 2450,
    saved: false,
  },
  {
    id: 'fallback-article-2',
    title: 'Reglementation peche: les points a verifier',
    category: 'Reglementation',
    author: 'Marie Lambert',
    readTime: '8 min',
    dateLabel: '12 Jan 2026',
    excerpt: 'Un rappel pratique des elements a controler avant une session.',
    views: 3890,
    saved: true,
  },
  {
    id: 'fallback-article-3',
    title: 'Peche a la mouche: debuter simplement',
    category: 'Technique',
    author: 'Pierre Durand',
    readTime: '6 min',
    dateLabel: '10 Jan 2026',
    excerpt: 'Les bases pour choisir son materiel et poser ses premiers lancers.',
    views: 1920,
    saved: false,
  },
  {
    id: 'fallback-article-4',
    title: 'Reperer un bon poste en riviere',
    category: 'Spots',
    author: 'Antoine Roussel',
    readTime: '7 min',
    dateLabel: '8 Jan 2026',
    excerpt: 'Lire les courants, les caches et les bordures pour mieux prospecter.',
    views: 2780,
    saved: false,
  },
];

export function getArticles(): ServiceResult<Article[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallbackArticles), delay);
  });
}
