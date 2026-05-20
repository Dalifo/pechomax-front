import { CatchPost, CatchPostDetail, EntityId, PostComment } from '../types/domain';
import { mapCatchPost, mapCatchPostDetail, mapPostComment } from './apiMappers';
import { BackendCatch, BackendCatchComment, BackendCatchSocial } from './backendTypes';
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
  const enriched = await Promise.all(
    catches.map(async (catchItem) => {
      const social = await getPostSocial(catchItem.id).catch(() => null);
      return {
        ...catchItem,
        commentsCount: social?.commentsCount ?? catchItem.commentsCount,
        isLikedByMe: social?.isLikedByMe ?? catchItem.isLikedByMe,
        isSavedByMe: social?.isSavedByMe ?? catchItem.isSavedByMe,
        likesCount: social?.likesCount ?? catchItem.likesCount,
        savesCount: social?.savesCount ?? catchItem.savesCount,
      };
    }),
  );
  return enriched.map(mapCatchPost);
}

export async function getRecentPosts(limit = 3): Promise<CatchPost[]> {
  const posts = await getPosts();
  return posts.slice(0, limit);
}

export async function getPostById(postId: EntityId): Promise<CatchPostDetail | null> {
  try {
    const catchItem = await httpClient.get<BackendCatch>(`/catches/${postId}`);
    const [social, comments] = await Promise.all([
      getPostSocial(postId).catch(() => null),
      getPostComments(postId).catch(() => []),
    ]);
    return {
      ...mapCatchPostDetail({
        ...catchItem,
        commentsCount: social?.commentsCount ?? catchItem.commentsCount,
        isLikedByMe: social?.isLikedByMe ?? catchItem.isLikedByMe,
        isSavedByMe: social?.isSavedByMe ?? catchItem.isSavedByMe,
        likesCount: social?.likesCount ?? catchItem.likesCount,
        savesCount: social?.savesCount ?? catchItem.savesCount,
      }),
      commentsList: comments,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }

    throw error;
  }
}

export async function getPostSocial(postId: EntityId): Promise<BackendCatchSocial> {
  return httpClient.get<BackendCatchSocial>(`/catches/${postId}/social`, { suppressUnauthorizedEvent: true });
}

export async function getPostComments(postId: EntityId): Promise<PostComment[]> {
  const comments = await httpClient.get<BackendCatchComment[]>(`/catches/${postId}/comments`);
  return comments.map(mapPostComment);
}

export async function addPostComment(postId: EntityId, content: string): Promise<PostComment> {
  const comment = await httpClient.post<BackendCatchComment>(`/catches/${postId}/comments`, { content });
  return mapPostComment(comment);
}

export async function setPostLiked(postId: EntityId, liked: boolean): Promise<BackendCatchSocial> {
  if (liked) {
    await httpClient.post(`/catches/${postId}/like`);
  } else {
    await httpClient.delete(`/catches/${postId}/like`);
  }

  return getPostSocial(postId);
}

export async function setPostSaved(postId: EntityId, saved: boolean): Promise<BackendCatchSocial> {
  if (saved) {
    await httpClient.post(`/catches/${postId}/save`);
  } else {
    await httpClient.delete(`/catches/${postId}/save`);
  }

  return getPostSocial(postId);
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
