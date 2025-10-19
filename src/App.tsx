import { Playground } from '@/components/Playground'
import { CookieConsent } from "@/components/cookie-consent";

function App() {
  // Set GTM consent using gtag API
  const setGtmConsent = (consent: "accepted" | "declined") => {
    if (typeof window !== "undefined") {
      // Declare window.gtag for TypeScript
      type GtagFn = (
        command: string,
        action: string,
        params: Record<string, string>
      ) => void;
      const gtag = (window as typeof window & { gtag?: GtagFn }).gtag;
      if (gtag) {
        if (consent === "accepted") {
          gtag("consent", "update", {
            ad_storage: "granted",
            analytics_storage: "granted",
          });
        } else {
          gtag("consent", "update", {
            ad_storage: "denied",
            analytics_storage: "denied",
          });
        }
      }
    }
  };

  // Callback for accepting cookies
  const handleAccept = () => {
    setGtmConsent("accepted");
  };

  // Callback for declining cookies
  const handleDecline = () => {
    setGtmConsent("declined");
  };

  return (
    <>
      <Playground />
      {/* Cookie Consent Popup */}
      <CookieConsent
        variant="minimal"
        onAcceptCallback={handleAccept}
        onDeclineCallback={handleDecline}
      />
    </>
  );
}

export default App
