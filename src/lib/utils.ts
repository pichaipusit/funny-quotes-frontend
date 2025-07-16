import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
}

export const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub;
  } catch {
    return null;
  }
};
