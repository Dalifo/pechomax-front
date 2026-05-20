import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/domain';
import { mapAuthUserFromPayload, mapAuthUserFromUser } from './apiMappers';
import { BackendAuthPayload, BackendAuthSelf, BackendUser } from './backendTypes';
import { httpClient, isUnauthorizedError, setApiAuthToken } from './httpClient';

export type AuthState = {
  isAuthenticated: boolean;
  token?: string | null;
  user: AuthUser | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

type AuthListener = (state: AuthState) => void;

const AUTH_STORAGE_KEY = 'pechomax.authState.v1';

let authState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const listeners = new Set<AuthListener>();

function emit() {
  listeners.forEach((listener) => listener(authState));
}

async function persistAuthState(state: AuthState) {
  try {
    if (!state.isAuthenticated) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence failures must not block auth state transitions.
  }
}

async function readPersistedAuthState() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthState;
  } catch {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    return null;
  }
}

async function setAuthState(nextState: AuthState) {
  authState = nextState;
  setApiAuthToken(nextState.token ?? null);
  await persistAuthState(nextState);
  emit();
  return authState;
}

export async function clearLocalAuthState() {
  return setAuthState({ isAuthenticated: false, token: null, user: null });
}

async function hydrateUserFromSelf(payload: BackendAuthPayload | BackendAuthSelf, fallbackEmail = '') {
  try {
    const user = await httpClient.get<BackendUser>('/users/self', { suppressUnauthorizedEvent: true, timeoutMs: 2000 });
    return mapAuthUserFromUser(user);
  } catch {
    return mapAuthUserFromPayload(payload, fallbackEmail);
  }
}

export function subscribeAuth(listener: AuthListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCurrentAuthState() {
  return authState;
}

export function getCurrentUserId() {
  return authState.user?.id ?? null;
}

async function restoreAuthState(): Promise<AuthState> {
  let persisted: AuthState | null = null;

  try {
    persisted = await readPersistedAuthState();
    if (persisted) {
      authState = persisted;
      setApiAuthToken(persisted.token ?? null);
      emit();
    }

    const payload = await httpClient.get<BackendAuthSelf>('/auth/login', {
      suppressUnauthorizedEvent: true,
      timeoutMs: 1500,
    });
    const user = await hydrateUserFromSelf(payload, persisted?.user?.email ?? '');
    return setAuthState({ isAuthenticated: true, token: persisted?.token ?? null, user });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      // React Native does not reliably persist Hono's signed Set-Cookie across launches.
      // If a user previously completed real backend login, keep the local snapshot only
      // for startup; any later protected 401 will clear it and navigate to Login.
      if (persisted?.isAuthenticated) {
        return persisted;
      }

      return setAuthState({ isAuthenticated: false, token: null, user: null });
    }

    return persisted ?? setAuthState({ isAuthenticated: false, token: null, user: null });
  }
}

export async function getAuthState(): Promise<AuthState> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutFallback = new Promise<AuthState>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve({ isAuthenticated: false, token: null, user: null });
      }, 1800);
    });

    return await Promise.race([restoreAuthState(), timeoutFallback]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

  }
}

export async function login(input: LoginInput): Promise<AuthState> {
  const payload = await httpClient.post<BackendAuthPayload>('/auth/login', {
    credential: input.email.trim(),
    password: input.password,
  });
  const user = await hydrateUserFromSelf(payload, input.email.trim().toLowerCase());

  return setAuthState({ isAuthenticated: true, token: payload.token ?? null, user });
}

export async function register(input: RegisterInput): Promise<AuthState> {
  const payload = await httpClient.post<BackendAuthPayload>('/auth/register', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    username: input.name.trim(),
  });
  const user = await hydrateUserFromSelf(payload, input.email.trim().toLowerCase());

  return setAuthState({ isAuthenticated: true, token: payload.token ?? null, user });
}

export async function logout(): Promise<AuthState> {
  try {
    await httpClient.get<string>('/auth/logout');
  } catch {
    // Logout must clear the local session even if the cookie-backed API is unreachable.
  }

  return setAuthState({ isAuthenticated: false, token: null, user: null });
}
