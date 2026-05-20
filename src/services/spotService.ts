import { EntityId, FishingSpot } from '../types/domain';
import { mapFishingSpot } from './apiMappers';
import { BackendLocation } from './backendTypes';
import { httpClient } from './httpClient';

export type CreateSpotInput = {
  description: string;
  latitude: number;
  longitude: number;
  name: string;
  speciesIds?: EntityId[];
};

export async function getSpots(): Promise<FishingSpot[]> {
  const locations = await httpClient.get<BackendLocation[]>('/locations/all');
  return locations.map(mapFishingSpot);
}

export async function getRecommendedSpots(limit = 3): Promise<FishingSpot[]> {
  const spots = await getSpots();
  return spots.slice(0, limit);
}

export async function getSpotById(spotId: EntityId): Promise<FishingSpot | null> {
  try {
    const location = await httpClient.get<BackendLocation>(`/locations/${spotId}`);
    return mapFishingSpot(location);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }

    throw error;
  }
}

export async function createSpot(input: CreateSpotInput): Promise<FishingSpot> {
  const location = await httpClient.post<BackendLocation>('/locations/create', {
    description: input.description.trim() || 'Spot ajoute depuis la carte PechoMax.',
    latitude: input.latitude.toFixed(6),
    longitude: input.longitude.toFixed(6),
    name: input.name.trim(),
    speciesIds: input.speciesIds ?? [],
  });

  return mapFishingSpot(location);
}
