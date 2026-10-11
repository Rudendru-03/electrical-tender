import Script from "next/script";
import { siteConfig } from "@/config/site";

/** GA4 and the optional live-chat widget. Each loads only when configured in the environment. */
export function Analytics() {
  const { gaId } = siteConfig.analytics;
  const { chat, chatSrc } = siteConfig.channels;

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      ) : null}
      {chat ? <Script src={chatSrc} strategy="lazyOnload" /> : null}
    </>
  );
}
