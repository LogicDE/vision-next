export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
}

import type { Signal } from '@builder.io/qwik';

export interface AuthState {
  user: Signal<User | null>;
  loading: Signal<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
