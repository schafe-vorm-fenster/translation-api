import {
  deeplTranslate,
  DeeplTranslateQuery,
  DeeplTranslateResponse,
} from "./deeplTranslate";
import { getLogger } from "../../logging/log-util";
import getUuidByString from "uuid-by-string";
import { localCache, remoteDatabaseCache } from "../cache/cachemanager";

/**
 * Use a two layer cache.
 * @param query: DeeplTranslateQuery
 * @returns DeeplTranslateResponse
 */
const memoryCached = async (
  query: DeeplTranslateQuery
): Promise<DeeplTranslateResponse> => {
  const log = getLogger("api.translate.cache");
  try {
    const cacheKey =
      "deepl_translate_" +
      query.sourceLanguage +
      "-" +
      query.targetLanguage +
      "_" +
      getUuidByString(query.text);
    log.debug(`[Cache] Check local cache for ${cacheKey}.`);
    return localCache.wrap(cacheKey, function () {
      try {
        log.debug(`[Cache] Check remote cache for ${cacheKey}.`);
        return remoteDatabaseCache.wrap(cacheKey, function () {
          log.info(`[Cache] Fetch original data for ${cacheKey}.`);
          return deeplTranslate(query);
        });
      } catch (error) {
        log.error((error as Error).message);
        throw error;
      }
    });
  } catch (error) {
    log.error((error as Error).message);
    return null;
  }
};

export const deeplTranslateCached = async (
  query: DeeplTranslateQuery
): Promise<DeeplTranslateResponse> => {
  if (process.env.DEACTIVATE_CACHE === "true") return deeplTranslate(query);
  return memoryCached(query);
};
