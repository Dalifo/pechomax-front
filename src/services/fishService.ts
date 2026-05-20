import { EntityId, FishSpecies } from '../types/domain';
import { mapFishSpecies } from './apiMappers';
import { BackendSpecies } from './backendTypes';
import { httpClient } from './httpClient';

export async function getFishSpecies(): Promise<FishSpecies[]> {
  const species: BackendSpecies[] = [];
  const seenIds = new Set<string>();

  for (let page = 1; page <= 20; page += 1) {
    const pageItems = await httpClient.get<BackendSpecies[]>(`/species?page=${page}`);

    pageItems.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        species.push(item);
      }
    });

    if (pageItems.length === 0 || pageItems.length < 15) {
      break;
    }
  }

  return species.map(mapFishSpecies);
}

export async function getFishById(fishId: EntityId): Promise<FishSpecies | null> {
  try {
    const species = await httpClient.get<BackendSpecies>(`/species/${fishId}`);
    return mapFishSpecies(species);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }

    throw error;
  }
}
