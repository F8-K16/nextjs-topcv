import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  roles: string[];
  exp: number;
};

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}
