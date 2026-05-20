import { Article, ServiceResult } from '../types/domain';

const delay = 160;

// TEMP_FALLBACK_DATA: Editorial articles are local until a content endpoint exists.
// TODO_BACKEND: Replace with a real articles/content API.
const fallbackArticles: Article[] = [
  {
    id: 'fallback-article-1',
    title: 'Les meilleurs leurres pour le brochet',
    category: 'Materiel',
    author: 'Equipe PechoMax',
    readTime: '5 min',
    dateLabel: '15 Jan 2026',
    excerpt: 'Sélection simple de leurres efficaces pour pêcher le brochet avec méthode.',
    views: 2450,
    saved: false,
  },
  {
    id: 'fallback-article-2',
    title: 'Réglementation pêche : les points à vérifier',
    category: 'Réglementation',
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
