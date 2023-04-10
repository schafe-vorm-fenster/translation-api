import { GetStaticProps, InferGetStaticPropsType } from "next";
import { createSwaggerSpec } from "next-swagger-doc";
import packageJson from "../package.json" assert { type: "json" };
import SwaggerUI, { SwaggerUIProps } from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faUpRightFromSquare,
  faUserAstronaut,
} from "@fortawesome/free-solid-svg-icons";

function ApiDoc({
  spec,
  packageJson,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <div className="swagger-ui">
        <div className="information-container wrapper">
          <section className="block col-12">
            <div>
              <div className="info">
                <hgroup className="main">
                  <h2 className="title">
                    {packageJson.name}
                    <span>
                      <small>
                        <pre className="version">{packageJson.version}</pre>
                      </small>
                      <small className="version-stamp">
                        <pre className="version">OAS3</pre>
                      </small>
                    </span>
                  </h2>
                </hgroup>
                <div className="description">
                  {packageJson?.description ? (
                    <p>{packageJson?.description}</p>
                  ) : null}
                  {packageJson?.homepage ? (
                    <p>
                      <a href={packageJson?.homepage}>
                        <FontAwesomeIcon icon={faUpRightFromSquare} />{" "}
                        {packageJson?.homepage}
                      </a>
                    </p>
                  ) : null}
                  {packageJson?.repository?.url ? (
                    <p>
                      <a href={packageJson?.repository?.url}>
                        <FontAwesomeIcon icon={faGithub} />{" "}
                        {packageJson?.repository?.url}
                      </a>
                    </p>
                  ) : null}
                  {packageJson?.author ? (
                    <p>
                      <a href={`mailto:${packageJson?.author?.email}`}>
                        <FontAwesomeIcon icon={faUserAstronaut} />{" "}
                        {packageJson?.author?.name} {packageJson?.author?.email}
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SwaggerUI spec={spec} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {},
    },
  } as SwaggerUIProps);

  return {
    props: {
      spec,
      packageJson,
    },
  };
};

export default ApiDoc;
