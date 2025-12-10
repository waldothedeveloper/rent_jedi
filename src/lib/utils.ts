import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PHONEREGEX = "^\\+[1-9]\\d{1,14}$";
export const EMAILREGEX = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
