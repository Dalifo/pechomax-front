import { ServiceResult, Shop } from '../types/domain';

// TODO(backend): no shop directory endpoint exists in pechomax-backend/apps/server.
// Deprecated fallback kept for the secondary shop screen.
const delay = 160;

const fallbackShops: Shop[] = [
  {
    id: 'fallback-shop-1',
    name: 'PechoMax Annecy',
    type: 'Magasin specialise',
    address: '12 rue du Lac, Annecy',
    distance: '2.1 km',
    phone: '04 00 00 00 01',
    rating: 4.7,
    reviews: 128,
    specialties: ['Carnassier', 'Leurres', 'Montages'],
    services: ['Conseil', 'Click and collect', 'Reparation moulinet'],
  },
  {
    id: 'fallback-shop-2',
    name: 'Rive Nature Peche',
    type: 'Appats et materiel',
    address: '8 avenue des Berges, Chambery',
    distance: '5.4 km',
    phone: '04 00 00 00 02',
    rating: 4.4,
    reviews: 86,
    specialties: ['Carpe', 'Appats', 'Bagagerie'],
    services: ['Appats vivants', 'Carte de peche', 'Conseil'],
  },
  {
    id: 'fallback-shop-3',
    name: 'Atelier du Pecheur',
    type: 'Occasion et atelier',
    address: '3 chemin des Saules, Aix-les-Bains',
    distance: '9.8 km',
    phone: '04 00 00 00 03',
    rating: 4.6,
    reviews: 54,
    specialties: ['Occasion', 'Reparation', 'Mouche'],
    services: ['Depot vente', 'Entretien', 'Montage lignes'],
  },
];

export function getShops(): ServiceResult<Shop[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fallbackShops), delay);
  });
}
