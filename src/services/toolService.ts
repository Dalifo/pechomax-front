import { FishingTool, ServiceResult } from '../types/domain';

const delay = 120;

// TEMP_FALLBACK_DATA: Tools are static helper content until weather/calculator endpoints exist.
// TODO_BACKEND: Replace live conditions with real tools/weather APIs.
const fallbackTools: FishingTool[] = [
  {
    id: 'conditions',
    title: 'Conditions du jour',
    description: 'Aide pratique pour preparer une sortie.',
    icon: 'partly-sunny-outline',
    value: '18 C - vent modere',
    items: ['Pression stable', 'Eau claire', 'Activite correcte'],
  },
  {
    id: 'moon',
    title: 'Phase lunaire',
    description: 'Indicateur simplifie pour anticiper les periodes actives.',
    icon: 'moon-outline',
    value: 'Premier quartier',
    items: ['Activite bonne', 'Coup du soir interessant'],
  },
  {
    id: 'season',
    title: 'Saisons',
    description: 'Resume des especes presentes dans vos carnets.',
    icon: 'calendar-outline',
    items: ['Truite: mars a septembre', 'Brochet: mai a janvier', "Carpe: toute l'annee"],
  },
  {
    id: 'checklist',
    title: 'Check-list materiel',
    description: 'Base de preparation avant depart.',
    icon: 'checkbox-outline',
    items: ['Cannes et moulinets', 'Leurres ou appats', 'Epuisette', 'Carte de peche'],
  },
];

export function getTools(): ServiceResult<FishingTool[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallbackTools), delay);
  });
}
