import type { AppProps } from "next/app";
import { DemoRuntime } from "@/demo/DemoRuntime";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DemoRuntime />
      <Component {...pageProps} />
    </>
  );
}