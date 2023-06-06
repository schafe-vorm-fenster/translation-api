import axios from "axios";
import QueryString from "qs";
import { SupportedLanguages } from "./supportedLanguages";
import { getLogger } from "../../logging/log-util";
import packageJson from "../../package.json" assert { type: "json" };

export type TranslateQuery = {
  text: string;
  sourceLanguage: SupportedLanguages;
  targetLanguage: SupportedLanguages;
};

export type DeeplTranslateResponseData = {
  text: string;
  detectedSourceLanguage?: string;
};

type DeeplTranslateApiResponseItemShape = {
  detected_source_language: string;
  text: string;
};

type DeeplTranslateApiResponseShape = {
  translations: DeeplTranslateApiResponseItemShape[];
};

export interface TranslateResponseData {
  sourceLanguage: SupportedLanguages;
  targetLanguage: SupportedLanguages;
  text: string;
}

export type TranslateResponse = TranslateResponseData | null;

export const deeplTranslate = async (
  query: TranslateQuery
): Promise<TranslateResponse> => {
  const log = getLogger("api.translate.deepl");

  try {
    const logText: string = `${query.sourceLanguage}>${
      query.targetLanguage
    } ${query.text.substring(0, 20)} …`;
    log.debug(`Execute deepl.translate(${logText})`);

    const requestData: object = {
      auth_key: process.env.DEEPL_AUTH_KEY,
      text: query.text.trim(),
      target_lang: query.targetLanguage.toUpperCase(),
      source_lang: query.sourceLanguage
        ? query.sourceLanguage.toUpperCase()
        : undefined,
    };

    const data: any = await axios
      .post(
        <string>process.env.DEEPL_API_ENDPOINT,
        QueryString.stringify(requestData),
        {
          headers: {
            Authorization:
              "DeepL-Auth-Key " + <string>process.env.DEEPL_AUTH_KEY,
            "User-Agent": packageJson.name,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        log.info(`tranlation by deepl succeeded for ${logText}`);

        const deeplResponse: DeeplTranslateApiResponseShape = response.data;
        const translateResponse: TranslateResponseData = {
          sourceLanguage: (
            query.sourceLanguage ||
            deeplResponse.translations[0].detected_source_language
          ).toLowerCase() as SupportedLanguages,
          targetLanguage: query.targetLanguage,
          text: deeplResponse.translations[0].text,
        };
        return translateResponse;
      })
      .catch(function (error) {
        log.error(error);
        throw new Error(error);
      });

    return data;
  } catch (error) {
    log.error((error as Error).message);
    return null;
  }
};
