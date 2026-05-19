import { EntityId } from '../types/domain';
import { UserProfile } from '../types/profile';
import { mapUserProfile } from './apiMappers';
import { BackendUser } from './backendTypes';
import { httpClient } from './httpClient';

export type UpdateProfileInput = {
  displayName: string;
  headline: string;
  location?: string;
};

export async function getProfile(): Promise<UserProfile> {
  const user = await httpClient.get<BackendUser>('/users/self');
  return mapUserProfile(user);
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const body = new FormData();
  body.append('username', input.displayName.trim());

  if (input.headline.trim()) {
    body.append('city', input.headline.trim());
  }

  if (input.location?.trim()) {
    body.append('region', input.location.trim());
  }

  const user = await httpClient.put<BackendUser>('/users/update/self', body);
  return mapUserProfile(user);
}

export async function getUserProfile(userId: EntityId): Promise<UserProfile> {
  const users = await httpClient.get<BackendUser[]>('/users/all');
  const user = users.find((item) => item.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  return mapUserProfile(user);
}

