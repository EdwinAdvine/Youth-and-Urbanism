import { z } from 'zod';

export const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8000'),
  VITE_APP_TITLE: z.string().default('Urban Home School'),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_PORT: z.string().default('3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and return environment variables.
 * Accepts a raw env object (import.meta.env in Vite, process.env in Node).
 * The calling app is responsible for providing the env object.
 */
export function validateEnv(env: Record<string, unknown>): EnvConfig {
  return envSchema.parse(env);
}
