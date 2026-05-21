import { FishSpecies } from '../types/domain';

type SpeciesDetail = Omit<FishSpecies, 'id' | 'knownSpots' | 'name' | 'pointValue'>;

const defaultRegulation =
  'Réglementation variable selon les zones : vérifier la réglementation locale avant chaque sortie.';

function normalizeSpeciesName(name?: string | null) {
  return (name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function detail(
  type: FishSpecies['type'],
  scientificName: string,
  season: string,
  habitat: string,
  techniques: string[],
  difficulty: string,
  averageSize: string,
  averageWeight: string,
  description: string,
  protectionStatus = 'Réglementation locale à vérifier',
): SpeciesDetail {
  return {
    averageSize,
    averageWeight,
    description,
    difficulty,
    habitat,
    protectionStatus,
    regulation: defaultRegulation,
    scientificName,
    season,
    techniques,
    type,
  };
}

// TEMP_STATIC_SPECIES_DETAILS: educational metadata until backend supports full species profiles.
const speciesDetailsByName: Record<string, SpeciesDetail> = {
  brochet: detail('freshwater', 'Esox lucius', 'Automne et printemps, avec une activité possible toute l’année selon les eaux.', 'Herbiers, bordures encombrées, anses calmes et cassures de lacs ou rivières lentes.', ['Leurre souple', 'Spinnerbait', 'Jerkbait', 'Vif réglementé'], 'Intermédiaire', '50 à 90 cm', '1 à 6 kg', 'Prédateur d’embuscade puissant, souvent posté près des herbiers ou des obstacles.'),
  sandre: detail('freshwater', 'Sander lucioperca', 'Fin de journée, automne et périodes d’eau teintée.', 'Fosses, cassures, piles de pont, zones profondes et fonds durs.', ['Verticale', 'Linéaire lent', 'Leurre souple', 'Mort manié'], 'Intermédiaire', '40 à 75 cm', '1 à 5 kg', 'Carnassier discret, sensible à la lumière et souvent actif près du fond.'),
  perche: detail('freshwater', 'Perca fluviatilis', 'Été et automne, souvent en bancs actifs.', 'Ports, herbiers, bordures rocheuses, pontons et cassures peu profondes.', ['Petit leurre souple', 'Cuiller', 'Drop shot', 'Micro jig'], 'Facile', '15 à 35 cm', '100 g à 1 kg', 'Poisson grégaire et curieux, idéal pour des sessions dynamiques au leurre léger.'),
  'carpe commune': detail('freshwater', 'Cyprinus carpio', 'Printemps à automne, surtout en eaux réchauffées.', 'Étangs, canaux, gravières, herbiers, bordures calmes et zones vaseuses.', ['Bouillette', 'Maïs', 'Method feeder', 'Pêche au posé'], 'Intermédiaire', '40 à 90 cm', '3 à 15 kg', 'Poisson puissant et méfiant, recherché pour ses combats longs et ses habitudes alimentaires régulières.'),
  silure: detail('freshwater', 'Silurus glanis', 'Été et automne, avec activité accrue par eau chaude.', 'Grands fleuves, fosses profondes, piles de pont et zones à courant marqué.', ['Clonk', 'Vif réglementé', 'Gros leurre souple', 'Pêche au posé'], 'Expert', '100 à 200 cm', '10 à 60 kg', 'Très grand prédateur de fleuve, capable de départs violents et de combats exigeants.'),
  'truite fario': detail('freshwater', 'Salmo trutta fario', 'Printemps et début d’été selon ouverture locale.', 'Rivières fraîches, radiers, courants oxygénés, caches sous berges et blocs.', ['Toc', 'Mouche', 'Cuiller', 'Petit poisson nageur'], 'Intermédiaire', '20 à 45 cm', '200 g à 1,5 kg', 'Salmonidé sauvage, exigeant sur la discrétion et la lecture du courant.', 'Espèce soumise à périodes d’ouverture et tailles minimales selon secteur.'),
  'black bass': detail('freshwater', 'Micropterus salmoides', 'Printemps à automne, hors périodes de reproduction à respecter.', 'Herbiers, bois morts, roselières, ports et zones peu profondes abritées.', ['Jig', 'Texas rig', 'Frog', 'Spinnerbait'], 'Intermédiaire', '25 à 50 cm', '500 g à 2 kg', 'Carnassier visuel et territorial, apprécié pour ses attaques spectaculaires.', 'Périodes de protection possibles pendant la reproduction selon zones.'),
  gardon: detail('freshwater', 'Rutilus rutilus', 'Toute l’année, surtout aux beaux jours.', 'Canaux, étangs, rivières lentes et bordures avec végétation.', ['Coup', 'Feeder', 'Asticot', 'Pain'], 'Facile', '10 à 25 cm', '50 à 300 g', 'Poisson blanc commun, souvent présent en bancs et très utile pour apprendre la pêche au coup.'),
  bar: detail('saltwater', 'Dicentrarchus labrax', 'Printemps à automne, selon marées et conditions.', 'Côtes rocheuses, estuaires, plages, ports et veines de courant.', ['Leurre souple', 'Poisson nageur', 'Surface', 'Appâts naturels'], 'Intermédiaire', '40 à 70 cm', '1 à 4 kg', 'Prédateur marin mobile, souvent actif autour des courants et des chasses.', 'Espèce soumise à règles spécifiques selon période et secteur.'),
  'dorade royale': detail('saltwater', 'Sparus aurata', 'Été et début d’automne.', 'Ports, digues, herbiers, parcs à coquillages et fonds sableux.', ['Crabe', 'Ver marin', 'Coquillage', 'Surfcasting léger'], 'Intermédiaire', '25 à 50 cm', '500 g à 2 kg', 'Poisson méfiant à la touche fine, capable de combats nerveux sur matériel léger.'),
  maquereau: detail('saltwater', 'Scomber scombrus', 'Printemps à automne lors des passages de bancs.', 'Pleine eau, digues, ports et zones de chasse proches du bord.', ['Mitraillette', 'Petit jig', 'Cuiller', 'Leurre métallique'], 'Facile', '20 à 40 cm', '150 g à 800 g', 'Poisson pélagique rapide, souvent en bancs et très actif quand il chasse.'),
  'lieu jaune': detail('saltwater', 'Pollachius pollachius', 'Automne à printemps, souvent près des structures.', 'Roches, épaves, têtes de roche et zones de courant.', ['Jig', 'Leurre souple', 'Traction', 'Pêche verticale'], 'Intermédiaire', '40 à 80 cm', '1 à 5 kg', 'Prédateur marin puissant, recherché près du fond ou dans les veines de courant.'),
  tanche: detail('freshwater', 'Tinca tinca', 'Printemps et été, surtout tôt le matin.', 'Étangs calmes, herbiers, fonds vaseux et bordures végétalisées.', ['Coup', 'Feeder', 'Maïs', 'Ver de terre'], 'Intermédiaire', '25 à 50 cm', '500 g à 2 kg', 'Poisson discret des eaux calmes, souvent actif dans les herbiers.'),
  'breme commune': detail('freshwater', 'Abramis brama', 'Printemps à automne.', 'Canaux, lacs, rivières lentes, fonds vaseux et plateaux peu profonds.', ['Feeder', 'Coup', 'Amorce', 'Asticot'], 'Facile', '25 à 55 cm', '500 g à 3 kg', 'Poisson blanc grégaire, apprécié pour les pêches d’amorçage régulières.'),
  rotengle: detail('freshwater', 'Scardinius erythrophthalmus', 'Printemps et été.', 'Herbiers, étangs, canaux lents et bordures ensoleillées.', ['Coup', 'Pain', 'Petit flotteur', 'Micro appâts'], 'Facile', '10 à 25 cm', '50 à 300 g', 'Petit poisson de surface et d’herbier, souvent visible près des bordures.'),
  chevesne: detail('freshwater', 'Squalius cephalus', 'Printemps à automne, très actif en surface l’été.', 'Rivières claires, radiers, bordures arborées et veines lentes.', ['Insecte artificiel', 'Petit leurre', 'Pain', 'Mouche'], 'Intermédiaire', '25 à 55 cm', '300 g à 2 kg', 'Poisson opportuniste et méfiant, excellent indicateur de discrétion.'),
  vairon: detail('freshwater', 'Phoxinus phoxinus', 'Printemps à été.', 'Petits cours d’eau frais, radiers et zones bien oxygénées.', ['Micro pêche', 'Observation', 'Petits appâts'], 'Facile', '5 à 10 cm', 'Quelques grammes', 'Petit poisson de rivière, souvent observé en bancs dans les eaux fraîches.'),
  anguille: detail('mixed', 'Anguilla anguilla', 'Activité nocturne, surtout par eaux douces réchauffées.', 'Rivières, canaux, estuaires, zones vaseuses et caches sombres.', ['Ver', 'Pêche au posé', 'Montage discret'], 'Expert', '40 à 90 cm', '300 g à 2 kg', 'Espèce migratrice nocturne, à traiter avec prudence en raison de son statut fragile.', 'Espèce fortement encadrée : vérifier les règles locales et périodes autorisées.'),
  'saumon atlantique': detail('mixed', 'Salmo salar', 'Selon remontées migratoires et ouvertures locales.', 'Fleuves côtiers, pools, courants puissants et rivières migratrices.', ['Mouche', 'Cuiller', 'Poisson nageur'], 'Expert', '60 à 100 cm', '3 à 12 kg', 'Grand migrateur emblématique, soumis à une réglementation stricte.', 'Espèce très réglementée : pêche parfois interdite ou soumise à déclaration.'),
  'truite arc en ciel': detail('freshwater', 'Oncorhynchus mykiss', 'Printemps à automne selon plans d’eau.', 'Plans d’eau, réservoirs, rivières fraîches et zones oxygénées.', ['Mouche', 'Cuiller', 'Teigne', 'Petit leurre'], 'Facile', '25 à 50 cm', '300 g à 2 kg', 'Truite robuste souvent présente en plans d’eau ou parcours spécifiques.'),
  'omble chevalier': detail('freshwater', 'Salvelinus alpinus', 'Saisons fraîches, souvent en profondeur.', 'Lacs profonds, eaux froides et zones oxygénées.', ['Verticale', 'Cuiller ondulante', 'Petits leurres', 'Traîne légère'], 'Expert', '25 à 60 cm', '300 g à 3 kg', 'Salmonidé de lac profond, exigeant sur la localisation et la profondeur.'),
  mulet: detail('saltwater', 'Mugilidae', 'Printemps à automne.', 'Ports, estuaires, plages calmes et zones riches en algues.', ['Pain', 'Pâte', 'Petite ligne flottante'], 'Intermédiaire', '25 à 60 cm', '500 g à 3 kg', 'Poisson méfiant et puissant, souvent visible mais difficile à décider.'),
  'mulet porc': detail('saltwater', 'Chelon ramada', 'Printemps à automne.', 'Estuaires, ports, canaux salés et zones saumâtres.', ['Pain', 'Pâte', 'Flotteur fin'], 'Intermédiaire', '25 à 55 cm', '500 g à 2 kg', 'Mulet robuste fréquent dans les zones portuaires et saumâtres.'),
  'mulet dore': detail('saltwater', 'Chelon auratus', 'Printemps à automne.', 'Ports, plages calmes, estuaires et bordures rocheuses.', ['Pain', 'Pâte', 'Flotteur fin'], 'Intermédiaire', '25 à 50 cm', '400 g à 2 kg', 'Mulet prudent, reconnaissable à ses reflets dorés près de l’opercule.'),
  'sole commune': detail('saltwater', 'Solea solea', 'Printemps à automne, souvent de nuit ou par mer calme.', 'Fonds sableux, estuaires, plages et zones peu profondes.', ['Ver marin', 'Surfcasting léger', 'Pêche au posé'], 'Intermédiaire', '20 à 45 cm', '200 g à 1 kg', 'Poisson plat discret, posé sur le sable et actif sur les petits invertébrés.'),
  turbot: detail('saltwater', 'Scophthalmus maximus', 'Printemps à automne.', 'Plages, baïnes, fonds sableux et zones de courant.', ['Lançon', 'Leurre souple', 'Surfcasting'], 'Expert', '35 à 80 cm', '1 à 8 kg', 'Poisson plat puissant et rare, souvent recherché sur fonds sableux dynamiques.'),
  congre: detail('saltwater', 'Conger conger', 'Toute l’année, surtout de nuit.', 'Roches, digues, épaves, trous et failles.', ['Poisson mort', 'Calamar', 'Pêche au posé fort'], 'Expert', '80 à 180 cm', '5 à 30 kg', 'Prédateur nocturne très puissant, à pêcher avec matériel robuste.'),
  'vieille commune': detail('saltwater', 'Labrus bergylta', 'Printemps à automne.', 'Roches, laminaires, digues et zones à crustacés.', ['Crabe', 'Crevette', 'Petits appâts', 'Pêche à soutenir'], 'Facile', '20 à 50 cm', '300 g à 2 kg', 'Poisson de roche coloré, opportuniste et présent dans les zones d’algues.'),
  bonite: detail('saltwater', 'Sarda sarda', 'Été et automne lors des chasses.', 'Pleine eau, chasses côtières et zones de petits poissons fourrage.', ['Jig', 'Casting jig', 'Leurre de surface', 'Traîne'], 'Expert', '40 à 80 cm', '1 à 6 kg', 'Pélagique rapide, très combatif sur matériel léger.'),
  'thon rouge': detail('saltwater', 'Thunnus thynnus', 'Saison très encadrée selon autorisations.', 'Large, chasses, tombants et zones riches en poissons fourrage.', ['Popping', 'Jigging', 'Broumé', 'Traîne'], 'Expert', 'Variable', 'Très variable', 'Grand pélagique puissant, réservé à une pratique très encadrée.', 'Espèce très réglementée : autorisations, bagues ou interdictions selon saison.'),
  'raie brunette': detail('saltwater', 'Raja undulata', 'Selon secteurs et réglementation locale.', 'Fonds sableux ou mixtes, plages, baies et estuaires.', ['Surfcasting', 'Poisson mort', 'Calamar', 'Pêche au posé'], 'Intermédiaire', '40 à 90 cm', '1 à 6 kg', 'Raie côtière vivant près du fond, à manipuler avec soin.'),
  'raie bouclee': detail('saltwater', 'Raja clavata', 'Selon secteurs et réglementation locale.', 'Fonds sableux, graviers, baies et plateaux côtiers.', ['Surfcasting', 'Appâts naturels', 'Pêche au posé'], 'Intermédiaire', '40 à 90 cm', '1 à 6 kg', 'Raie fréquente sur certains fonds côtiers, sensible aux règles locales.'),
  'rouget barbet': detail('saltwater', 'Mullus surmuletus', 'Été à automne.', 'Fonds sableux, graviers, herbiers et bordures rocheuses.', ['Ver marin', 'Petits appâts', 'Pêche fine au posé'], 'Intermédiaire', '15 à 35 cm', '100 g à 600 g', 'Poisson de fond recherchant petits invertébrés, apprécié pour sa touche délicate.'),
};

export function enrichSpecies(name?: string | null): SpeciesDetail {
  const normalized = normalizeSpeciesName(name);
  return speciesDetailsByName[normalized] ?? {
    averageSize: 'Variable selon l’espèce et le milieu',
    averageWeight: 'Variable',
    description: `${name ?? 'Cette espèce'} est référencée dans PechoMax. Les informations détaillées seront enrichies progressivement.`,
    difficulty: 'À évaluer',
    habitat: 'Habitats variables selon les secteurs PechoMax.',
    protectionStatus: 'Réglementation locale à vérifier',
    regulation: defaultRegulation,
    scientificName: name ?? 'Non renseigné',
    season: 'À vérifier selon le secteur',
    techniques: ['Observation du milieu', 'Techniques locales adaptées'],
    type: 'freshwater',
  };
}
