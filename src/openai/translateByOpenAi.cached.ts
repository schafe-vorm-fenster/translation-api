import { OpenAiQuery, OpenAiTranslations } from "./openAiTranslation.types";
import { translateByOpenAi } from "./translateByOpenAi";
import { twoLayerCached } from "../cache/twoLayerCached";

export const translateByOpenAiCached = async (
  query: OpenAiQuery
): Promise<OpenAiTranslations | null> => {
  if (process.env.DEACTIVATE_CACHE === "true") return translateByOpenAi(query);
  return twoLayerCached(translateByOpenAi, query, "openai");
};
