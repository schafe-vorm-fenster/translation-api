import { languages } from "./openAiTranslation.types";

export const translateByOpenAiPromt: string[] = [
  "Translate to German (de), English (en), Polish (pl), Ukrainian (uk), and Russian (ru).",
  "Keep the original language.",
  "Respond with JSON matching this interface:",
  "interface OpenAiTranslation {\nlanguage: string; // ISO 639-1\ntitle: string;\ntext: string;\ntags?: string[];\n}\ninterface OpenAiTranslations {\ntranslations: OpenAiTranslation[];\n}\n",
];
