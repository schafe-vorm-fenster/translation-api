import type { NextApiRequest, NextApiResponse } from "next";

import { getLogger } from "../../../logging/log-util";
import { OpenAiTranslations } from "../../../src/openai/openAiTranslation.types";
import { translateByOpenAiCached } from "../../../src/openai/translateByOpenAi.cached";

type TranslateResponse = OpenAiTranslations | null;

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Translates content from text, json or markup.
 *     description:
 *     tags:
 *       - Translate
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: text
 *         description: Text, Json or Markup to be translated.
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Translated text.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *       204:
 *         description: Could not receive a translated text.
 *       400:
 *         description: Missing identifier. Please provide a text and a target language.
 *       404: Could not receive a translated text.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const log = getLogger("api.translate");

  const content: string | undefined = req.body;
  log.debug({ body: req.body }, "req.body");

  if (!content || content.length <= 5)
    return res.status(400).json({
      status: 400,
      message: "Missing body. Please provide content as body.",
    });

  const data: OpenAiTranslations | null = await translateByOpenAiCached({
    query: content,
  });

  if (!data)
    return res
      .status(404)
      .json({ status: 404, message: "Could not receive a translated text." });

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(data);
}
