/**
 * CookieBanner — lightweight cookie notice with essential/all consent.
 *
 * GuildMark currently sets only strictly-necessary cookies (httpOnly refresh
 * token) and functional localStorage entries (theme, language), so this is a
 * notice rather than a blocking consent wall. The stored preference gates any
 * future non-essential (analytics/marketing) scripts: check
 * `getCookieConsent()?.analytics` before loading them.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cookie } from "lucide-react";
import { Button } from "./ui/button";

const CONSENT_KEY = "gm.cookieConsent";
const CONSENT_VERSION = 1;

export interface CookieConsent {
  version: number;
  necessary: true;
  analytics: boolean;
  decidedAt: string;
}

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    // Re-prompt if the consent schema has changed since the user decided.
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (analytics: boolean) => {
    saveConsent(analytics);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label={t("cookies.ariaLabel")}
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-md bg-brand-subtle p-2 text-primary">
            <Cookie className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-foreground/80">
            {t("cookies.message")}{" "}
            {/* Plain <a> so the banner can render outside RouterProvider */}
            <a
              href="/compliance/privacy-policy"
              className="text-primary hover:underline"
            >
              {t("cookies.learnMore")}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col md:flex-row">
          <Button size="sm" onClick={() => decide(true)}>
            {t("cookies.acceptAll")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => decide(false)}>
            {t("cookies.essentialOnly")}
          </Button>
        </div>
      </div>
    </div>
  );
}
