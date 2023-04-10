import type { NextPage } from "next";
import Head from "next/head";

const Page401: NextPage = () => {
  return (
    <div>
      <Head>
        <title>401 Unauthorized</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>401 Unauthorized</h1>
        <p>Please provide a valid token to use this api.</p>
      </main>
    </div>
  );
};

export default Page401;
