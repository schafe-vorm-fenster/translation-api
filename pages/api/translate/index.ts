import type { NextApiRequest, NextApiResponse } from "next";
import {
  TranslateQuery,
  TranslateResponse,
} from "../../../src/deepl/deeplTranslate";
import { SupportedLanguages } from "../../../src/deepl/supportedLanguages";
import { deeplTranslateCached } from "../../../src/deepl/deeplTranslateCached";
import { getLogger } from "../../../logging/log-util";
import { NextResponse } from "next/server";
import { IncomingMessage, ServerResponse } from "http";
import { canStale } from "axios-cache-interceptor";

/**
 * @swagger
 * /api/translate:
 *   get:
 *     summary: Translates a text or markup. Uses GET to facilitate caching.
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
 *       - name: text
 *         description: Text to be translated.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Translated text.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sourceLanguage:
 *                  type: string
 *                  description: Language code of the source text, detected if not given.
 *                targetLanguage:
 *                  type: string
 *                  description: Language code of the translated text.
 *                text:
 *                  type: string
 *                  description: Translated text.
 *       204:
 *         description: Could not receive a translated text.
 *       400:
 *         description: Missing identifier. Please provide a text and a target language.
 *
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Translates a text or markup.
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
 *       - name: text
 *         description: Text to be translated.
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Translated text.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sourceLanguage:
 *                  type: string
 *                  description: Language code of the source text, detected if not given.
 *                targetLanguage:
 *                  type: string
 *                  description: Language code of the translated text.
 *                text:
 *                  type: string
 *                  description: Translated text.
 *       204:
 *         description: Could not receive a translated text.
 *       400:
 *         description: Missing identifier. Please provide a text and a target language.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const log = getLogger("api.translate");

  let sourcelanguage: SupportedLanguages | undefined = undefined;
  let targetlanguage: SupportedLanguages | undefined = undefined;
  let text: string | undefined = undefined;

  if (req.method === "GET") {
    sourcelanguage = req.query.sourcelanguage as SupportedLanguages;
    targetlanguage = req.query.targetlanguage as SupportedLanguages;
    text = req.query.text as string;
  } else if (req.method === "POST") {
    sourcelanguage = req.query.sourcelanguage as SupportedLanguages;
    targetlanguage = req.query.targetlanguage as SupportedLanguages;
    text = req.body as string;
  }

  if (!text || !targetlanguage)
    return res.status(400).json({
      message:
        "Missing identifier. Please provide a text and a target language.",
    });

  const query: TranslateQuery = {
    text: <string>text,
    sourceLanguage: <SupportedLanguages>sourcelanguage,
    targetLanguage: <SupportedLanguages>targetlanguage,
  };

  const data: TranslateResponse = await deeplTranslateCached(query);

  if (!data)
    return res
      .status(204)
      .json({ message: "Could not receive a translated text." });

  // add cache header to allow cdn caching of responses
  const cacheMaxAge: string = process.env.CACHE_MAX_AGE || "604800"; // 7 days
  const cacheStaleWhileRevalidate: string =
    process.env.CACHE_STALE_WHILE_REVALIDATE || "120"; // 2 minutes

  res.setHeader(
    "Cache-Control",
    `max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheStaleWhileRevalidate}`
  );
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(data);
}
