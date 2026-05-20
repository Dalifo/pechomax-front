import { EntityId, FishingSpot, SpotComment, WaterType } from '../types/domain';
import { mapFishingSpot, mapSpotComment } from './apiMappers';
import { BackendLocation, BackendLocationComment, BackendLocationRatingSummary } from './backendTypes';
import { httpClient } from './httpClient';

export type CreateSpotInput = {
  description: string;
  latitude: number;
  longitude: number;
  name: string;
  photoName?: string;
  photoType?: string;
  photoUri?: string;
  speciesIds?: EntityId[];
  waterType: WaterType;
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
  const body = new FormData();

  body.append('description', input.description.trim());
  body.append('latitude', input.latitude.toFixed(6));
  body.append('longitude', input.longitude.toFixed(6));
  body.append('name', input.name.trim());
  body.append('speciesIds', JSON.stringify(input.speciesIds ?? []));
  body.append('waterType', input.waterType === 'saltwater' ? 'sea' : 'freshwater');

  if (input.photoUri) {
    body.append('pictures', {
      name: input.photoName ?? 'spot.jpg',
      type: input.photoType ?? 'image/jpeg',
      uri: input.photoUri,
    } as unknown as Blob);
  }

  const location = await httpClient.post<BackendLocation>('/locations/create', body);

  return mapFishingSpot(location);
}

export async function getFavoriteSpots(): Promise<FishingSpot[]> {
  const locations = await httpClient.get<BackendLocation[]>('/locations/favorites/self');
  return locations.map(mapFishingSpot);
}

export async function favoriteSpot(spotId: EntityId): Promise<void> {
  await httpClient.post(`/locations/${spotId}/favorite`);
}

export async function unfavoriteSpot(spotId: EntityId): Promise<void> {
  await httpClient.delete(`/locations/${spotId}/favorite`);
}

export async function getSpotComments(spotId: EntityId): Promise<SpotComment[]> {
  const comments = await httpClient.get<BackendLocationComment[]>(`/locations/${spotId}/comments`);
  return comments.map(mapSpotComment);
}

export async function addSpotComment(spotId: EntityId, content: string): Promise<SpotComment> {
  const comment = await httpClient.post<BackendLocationComment>(`/locations/${spotId}/comments`, { content });
  return mapSpotComment(comment);
}

export async function deleteSpotComment(commentId: EntityId): Promise<void> {
  await httpClient.delete(`/location-comments/${commentId}`);
}

export async function rateSpot(spotId: EntityId, rating: number): Promise<{
  averageRating: number;
  myRating: number | null;
  ratingsCount: number;
}> {
  const summary = await httpClient.post<BackendLocationRatingSummary>(`/locations/${spotId}/rating`, { rating });
  return {
    averageRating: Number(summary.averageRating ?? 0),
    myRating: summary.myRating == null ? null : Number(summary.myRating),
    ratingsCount: Number(summary.ratingsCount ?? 0),
  };
}
