"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { SiteProvider } from "@/lib/site-context";
import SmoothScroll from "./SmoothScroll";
import CustomCursor from "./CustomCursor";
import Loader from "./Loader";
import Nav from "./Nav";
import Footer from "./Footer";
import AccessibilityPanel from "./AccessibilityPanel";

export default function SiteShell({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <SiteProvider>
      <SmoothScroll />
      <CustomCursor />
      <Loader dict={dict} />
      <Nav lang={lang} dict={dict} />
      <main id="main">{children}</main>
      <Footer dict={dict} />
      <AccessibilityPanel lang={lang} dict={dict} />
    </SiteProvider>
  );
}
