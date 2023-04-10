import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeeplTranslateQuery,
  DeeplTranslateResponse,
} from "../../src/deepl/deeplTranslate";
import { SupportedLanguages } from "../../src/deepl/supportedLanguages";
import { deeplTranslateCached } from "../../src/deepl/deeplTranslateCached";
import { getLogger } from "../../logging/log-util";

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Translates a text by deepl.com.
 *     description:
 *     tags:
 *       - Vendor - DeepL API
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: sourcelanguage
 *         description: Source language as two character code.
 *         in: query
 *         required: true
 *         type: string
 *       - name: targetlanguage
 *         description: Target language as two character code.
 *         in: query
 *         required: true
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
  const log = getLogger("api.translate");

  const { sourcelanguage, targetlanguage } = req.query;
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

  const data: DeeplTranslateResponse = await deeplTranslateCached(query);

  if (!data) return res.status(204).end("Could not receive a translated text.");

  return res.status(200).json(data);
}
