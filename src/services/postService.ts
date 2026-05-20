import { CatchPost, CatchPostDetail, EntityId } from '../types/domain';
import { mapCatchPost, mapCatchPostDetail } from './apiMappers';
import { BackendCatch } from './backendTypes';
import { httpClient } from './httpClient';

export type CreatePostInput = {
  fishName: string;
  speciesId: EntityId;
  weightLabel: string;
  lengthLabel?: string;
  spotName: string;
  locationId: EntityId;
  dateLabel: string;
  description?: string;
  photoUri?: string;
  photoName?: string;
  photoType?: string;
};

function parseMeasurement(value: string, fallback?: number) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function integerMeasurement(value: number) {
  return Math.max(1, Math.round(value));
}

function dateFromLabel(label: string) {
  const lower = label.trim().toLowerCase();
  if (!label || lower === "aujourd'hui" || lower === 'aujourd hui') {
    return new Date();
  }

  const date = new Date(label);
  return Number.isNaN(date.getTime()) ? new Date() : date;
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

  const parsedWeight = parseMeasurement(input.weightLabel);
  const parsedLength = parseMeasurement(input.lengthLabel ?? '');

  if (parsedWeight === undefined || parsedLength === undefined) {
    throw new Error('Renseignez un poids et une longueur valides.');
  }

  const weight = integerMeasurement(parsedWeight);
  const length = integerMeasurement(parsedLength);

  const body = new FormData();
  body.append('date', dateFromLabel(input.dateLabel).toISOString());
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
