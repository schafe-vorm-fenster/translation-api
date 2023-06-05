import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeeplTranslateQuery,
  DeeplTranslateResponse,
} from "../../../src/deepl/deeplTranslate";
import { SupportedLanguages } from "../../../src/deepl/supportedLanguages";
import { deeplTranslateCached } from "../../../src/deepl/deeplTranslateCached";
import { getLogger } from "../../../logging/log-util";

/**
 * @swagger
 * /api/translate/{hash}:
 *   post:
 *     summary: Translates a text by deepl.com.
 *     description:
 *     tags:
 *       - Translate
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sourcelanguage
 *         description: Source language as two character code.
 *         in: query
 *         type: string
 *       - name: targetlanguage
 *         description: Target language as two character code.
 *         in: query
 *         required: true
 *         type: string
 *       - name: hash
 *         description: Hash of the text to be translated.
 *         in: path
 *         type: string
 *     requestBody:
 *       description: Text to be translated.
 *       required: true
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Translated text.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeeplTranslateResponse>
) {
  const log = getLogger("api.translate.withhash");
  const { hash, sourcelanguage, targetlanguage } = req.query;

  if (!hash)
    return res
      .status(400)
      .end("Missing hash. Please provide a cache hash value as path segment.");

  const text = <string>req.body;

  if (!text || !targetlanguage)
    return res
      .status(400)
      .end("Missing identifier. Please provide a text and a target language.");

  const query: DeeplTranslateQuery = {
    text: <string>text,
    sourceLanguage: <SupportedLanguages>sourcelanguage,
    targetLanguage: <SupportedLanguages>targetlanguage,
  };

  const data: DeeplTranslateResponse = await deeplTranslateCached(
    query,
    <string>hash
  );

  if (!data) return res.status(204).end("Could not receive a translated text.");

  // add cache header to allow cdn caching of responses
  const cacheMaxAge: string = process.env.CACHE_MAX_AGE || "604800"; // 7 days
  const cacheStaleWhileRevalidate: string =
    process.env.CACHE_STALE_WHILE_REVALIDATE || "120"; // 2 minutes
  res.setHeader(
    "Cache-Control",
    `max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheStaleWhileRevalidate}`
  );

  return res.status(200).json(data);
}
