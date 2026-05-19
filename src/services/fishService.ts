import { EntityId, FishSpecies } from '../types/domain';
import { mapFishSpecies } from './apiMappers';
import { BackendSpecies } from './backendTypes';
import { httpClient } from './httpClient';

export async function getFishSpecies(): Promise<FishSpecies[]> {
  const species = await httpClient.get<BackendSpecies[]>('/species');
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

