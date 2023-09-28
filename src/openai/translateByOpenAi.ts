import axios from "axios";
import { getLogger } from "../../logging/log-util";
import { OpenAiQuery, OpenAiTranslations } from "./openAiTranslation.types";
import { translateByOpenAiPromt } from "./translateByOpenAi.promt";

export const translateByOpenAi = async (
  query: OpenAiQuery
): Promise<OpenAiTranslations | null> => {
  const log = getLogger("translateByOpenAi");

  // combine promt and content
  const fullChatPromt: string =
    translateByOpenAiPromt.join("\n\n") + JSON.stringify(query);

  // build request body
  const requestBody: object = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Act as an API. Return JSON only.",
      },
      {
        role: "user",
        content: fullChatPromt,
      },
    ],
  };

  // set options for axios auth header
  const requestOptions: object = {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  return await axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      requestBody,
      requestOptions
    )
    .then((response) => {
      // well, something was returned
      log.debug(response.data, "OpenAI raw response.");

      // check if response is valid and contains choices[]
      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0
      ) {
        // return first choice
        return JSON.parse(
          response.data.choices[0].message.content
        ) as OpenAiTranslations;
      } else {
        log.error(
          "No valid json response from OpenAI.",
          response.data.choices[0]
        );
        throw new Error("No valid response from OpenAI.");
      }
    })
    .catch((error) => {
      log.error(error);
      return null;
    });
};
