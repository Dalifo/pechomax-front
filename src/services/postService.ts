import { CatchPost, CatchPostDetail, EntityId } from '../types/domain';
import { mapCatchPost, mapCatchPostDetail } from './apiMappers';
import { BackendCatch } from './backendTypes';
import { httpClient } from './httpClient';

export type CreatePostInput = {
  date: Date;
  speciesId: EntityId;
  weightGrams: number;
  lengthCentimeters: number;
  locationId: EntityId;
  description?: string;
  photoUri?: string;
  photoName?: string;
  photoType?: string;
};

function integerMeasurement(value: number) {
  return Math.max(1, Math.round(value));
}

export async function getPosts(): Promise<CatchPost[]> {
  const catches = await httpClient.get<BackendCatch[]>('/catches');
  return catches.map(mapCatchPost);
}

export async function getRecentPosts(limit = 3): Promise<CatchPost[]> {
  const posts = await getPosts();
  return posts.slice(0, limit);
}

export async function getPostById(postId: EntityId): Promise<CatchPostDetail | null> {
  try {
    const catchItem = await httpClient.get<BackendCatch>(`/catches/${postId}`);
    return mapCatchPostDetail(catchItem);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }

    throw error;
  }
}

export async function createPost(input: CreatePostInput): Promise<CatchPost> {
  if (!input.photoUri) {
    throw new Error('Ajoutez une photo pour publier votre prise.');
  }

  if (!Number.isFinite(input.weightGrams) || !Number.isFinite(input.lengthCentimeters)) {
    throw new Error('Renseignez un poids et une longueur valides.');
  }

  const weight = integerMeasurement(input.weightGrams);
  const length = integerMeasurement(input.lengthCentimeters);

  const body = new FormData();
  body.append('date', input.date.toISOString().slice(0, 10));
  body.append('description', input.description ?? '');
  body.append('length', String(length));
  body.append('locationId', input.locationId);
  body.append('speciesId', input.speciesId);
  body.append('weight', String(weight));
  body.append('pictures', {
    name: input.photoName ?? 'catch.jpg',
    type: input.photoType ?? 'image/jpeg',
    uri: input.photoUri,
  } as unknown as Blob);

  const catchItem = await httpClient.post<BackendCatch>('/catches/create', body);
  return mapCatchPost(catchItem);
}
