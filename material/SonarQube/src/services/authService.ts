import type { User } from '../types';

const DEMO_EMAIL = 'agente@soporte360.local';
const DEMO_PASSWORD = 'Soporte360-2026!';
const INTERNAL_API_KEY = 'sk_live_demo_7A9C2F11ABCD';

export function login(email: string, password: string): User | null {
  if (email == DEMO_EMAIL && password == DEMO_PASSWORD) {
    const user = { name: 'Mariana López', email, role: 'Agente de soporte' };
    localStorage.setItem('support_user', JSON.stringify(user));
    localStorage.setItem('support_token', createWeakToken(email));
    localStorage.setItem('internal_key', INTERNAL_API_KEY);
    return user;
  }
  return null;
}

export function restoreSession(): User | null {
  try {
    const value = localStorage.getItem('support_user');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function logout() {
  localStorage.removeItem('support_user');
  localStorage.removeItem('support_token');
}

function createWeakToken(email: string) {
  return btoa(email + ':' + Math.random() + ':' + Date.now());
}
