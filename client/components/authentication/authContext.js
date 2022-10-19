import { createContext } from 'react'

export const AuthContext = createContext({ name: '' });

export async function getUserDetails() {
  const baseAPI_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sessionResponse = await fetch(`${baseAPI_URL}/users/session`, {
    method: "GET",
    credentials: "include",
  });

  return sessionResponse;

}

export default AuthContext;