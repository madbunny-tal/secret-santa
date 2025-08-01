import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return ( 
  <>
    <Toaster />
    <Component {...pageProps} />;
  </>
  );
}
