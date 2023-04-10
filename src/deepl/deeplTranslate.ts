import axios from "axios";
import QueryString from "qs";
import { SupportedLanguages } from "./supportedLanguages";
import { getLogger } from "../../logging/log-util";

export type DeeplTranslateQuery = {
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

export type DeeplTranslateResponse = DeeplTranslateResponseData | null;

export const deeplTranslate = async (
  query: DeeplTranslateQuery
): Promise<DeeplTranslateResponse> => {
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
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        log.info(`tranlation by deepl succeeded for ${logText}`);
        return response.data;
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
