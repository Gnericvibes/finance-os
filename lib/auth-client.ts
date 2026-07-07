"use client";

import { createAuthClient } from "better-auth/react";

const baseURL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}`
  : "http://localhost:3000";

export const authClient = createAuthClient({ baseURL });