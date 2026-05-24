import { apiFetch } from "./client";

export interface SchemaVariable {
  id: string;
  layer: string;
  sub_category: string | null;
  label: string;
  input_type: string;
  options: string[];
  helper_text: string;
  is_quantitative: boolean;
  unknown_option: string | null;
  max_select: number | null;
  short_label: string;
  tags: string[];
}

export interface SchemaLayer {
  title: string;
  variables: SchemaVariable[];
}

export interface SchemaResponse {
  version: string;
  layers: Record<string, SchemaLayer>;
}

export function getSchema(): Promise<SchemaResponse> {
  return apiFetch<SchemaResponse>("/api/schema");
}

export function getScenarios<T>(): Promise<T> {
  return apiFetch<T>("/api/scenarios");
}

export function getOptions<T>(): Promise<T> {
  return apiFetch<T>("/api/options");
}

export function fetchScenarios<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>("/api/scenarios");
}

export function fetchOptions<T = Record<string, unknown>>(): Promise<T> {
  return apiFetch<T>("/api/options");
}
