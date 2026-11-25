import { useEffect, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import "./InstallPWA.css";

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.navigator.standalone === true
  );
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setVisible(false);
      return undefined;
    }

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <aside className="pwa-install" aria-label="Install SEIS app">
      <div className="pwa-install-main">
        <span className="pwa-install-icon" aria-hidden="true">
          <FiDownload />
        </span>
        <div className="pwa-install-copy">
          <strong>Install SEIS</strong>
          <small>Keep election data one tap away, even offline.</small>
        </div>
        <button type="button" className="pwa-install-button" onClick={handleInstall}>
          Install
        </button>
        <button
          type="button"
          className="pwa-install-close"
          onClick={() => setVisible(false)}
          aria-label="Dismiss install prompt"
        >
          <FiX />
        </button>
      </div>
      {showHelp && (
        <div className="pwa-install-help" role="status">
          <strong>Install instructions</strong>
          <span>
            On Chrome or Edge, use the browser menu &ldquo;Install app&rdquo;. On iPhone or iPad,
            tap Share and then &ldquo;Add to Home Screen&rdquo;. Use HTTPS (or localhost) for the
            install option to appear.
          </span>
        </div>
      )}
    </aside>
  );
}
