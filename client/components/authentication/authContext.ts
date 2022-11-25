import React, { createContext } from 'react'

export interface AuthContextProps {
  name: string
}

export const AuthContext: React.Context<AuthContextProps> = createContext({ name: '' });

export async function getUserDetails() {
  const baseAPI_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sessionResponse = await fetch(`${baseAPI_URL}/users/session`, {
    method: "GET",
    credentials: "include",
  });

  return sessionResponse;

}

export default AuthContext;