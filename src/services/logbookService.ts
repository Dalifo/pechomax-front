import { LogbookCatch } from '../types/domain';
import { mapLogbookCatch } from './apiMappers';
import { BackendCatch } from './backendTypes';
import { httpClient } from './httpClient';

export async function getLogbook(): Promise<LogbookCatch[]> {
  const catches = await httpClient.get<BackendCatch[]>('/catches/self');
  return catches.map(mapLogbookCatch);
}

