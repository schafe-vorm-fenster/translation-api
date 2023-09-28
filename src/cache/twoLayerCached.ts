import getUuidByString from "uuid-by-string";
import { getLogger } from "../../logging/log-util";
import { localCache, remoteDatabaseCache } from "./cachemanager";
import packageJson from "../../package.json" assert { type: "json" };

/**
 * Use a two layer cache.
 * @param query: any
 * @returns any
 */
export const twoLayerCached = async (
  operation: any,
  query: any,
  cluster: string,
  key?: string
): Promise<any> => {
  const log = getLogger("twoLayerCached");

  try {
    const cacheKey =
      "translation-api_" +
      packageJson.version +
      "_" +
      cluster +
      "_" +
      getUuidByString(key ? key : JSON.stringify(query) || String(query));

    log.debug({ cacheKey: cacheKey }, "Check local cache.");
    return localCache.wrap(cacheKey, function () {
      try {
        log.debug({ cacheKey: cacheKey }, "Check remote cache.");
        return remoteDatabaseCache.wrap(cacheKey, function () {
          log.info({ cacheKey: cacheKey }, "Fetch original data.");
          return operation(query);
        });
      } catch (error: Error | any) {
        log.error(error, error?.message);
        throw error;
      }
    });
  } catch (error: Error | any) {
    log.error(error, error?.message);
    return null;
  }
};
