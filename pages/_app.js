import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Google Font untuk cewek bumi vibes 🌱 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>StockApp</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
