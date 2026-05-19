import { EntityId, FishingSpot } from '../types/domain';
import { mapFishingSpot } from './apiMappers';
import { BackendLocation } from './backendTypes';
import { httpClient } from './httpClient';

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

