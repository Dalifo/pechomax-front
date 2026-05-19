import { useCallback, useEffect, useState } from 'react';
import {
  AuthState,
  getCurrentAuthState,
  getAuthState,
  login as loginService,
  LoginInput,
  logout as logoutService,
  register as registerService,
  RegisterInput,
  subscribeAuth,
} from '../services/authService';

type AuthHookState = AuthState & {
  loading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthHookState>({
    ...getCurrentAuthState(),
    loading: false,
  });

  useEffect(() => {
    return subscribeAuth((nextState) => {
      setState((current) => ({
        ...current,
        ...nextState,
      }));
    });
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const nextState = await loginService(input);
      setState({ ...nextState, loading: false });
      return nextState;
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const nextState = await registerService(input);
      setState({ ...nextState, loading: false });
      return nextState;
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const nextState = await logoutService();
      setState({ ...nextState, loading: false });
      return nextState;
    } finally {
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    register,
  };
}

export function useAuthBootstrap() {
  const bootstrap = useCallback(async () => {
    return getAuthState();
  }, []);

  return { bootstrap };
}
