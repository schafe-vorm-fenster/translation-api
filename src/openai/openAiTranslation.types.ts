export const languages: string[] = ["de", "en", "pl", "uk", "ru"];

export interface OpenAiTranslation {
  language: string; // ISO 639-1
  title: string;
  text: string;
  tags?: string[];
}

export interface OpenAiTranslations {
  translations: OpenAiTranslation[];
}

export type OpenAiQuery = any;
