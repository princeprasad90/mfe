import React, { useState, useEffect } from "react";
import "./cbms.css";
import { matchRoute } from "./routes";
import PaymentsListPage from "./pages/list/PaymentsListPage";
import PaymentDetailPage from "./pages/detail/PaymentDetailPage";
import CreatePaymentPage from "./pages/create/CreatePaymentPage";

// Props injected by the Shell via mount() — mirrors @mfe/platform-contracts MountProps
type Props = {
  basePath?: string;
  routePath?: string;
  user?: { id: string; email: string; displayName: string };
  emitEvent?: <T>(event: string, detail: T) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
};

const CbmsApp = ({ basePath = "/cbms", emitEvent, onEvent }: Props) => {
  const [, setTick] = useState(0);

  // Re-render on every navigation so route matching picks up new URL
  useEffect(() => {
    const handler = () => setTick((n) => n + 1);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const goTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const route = matchRoute(window.location.pathname, window.location.search);

  if (route.name === "create") {
    return (
      <CreatePaymentPage
        basePath={basePath ?? "/cbms"}
        goTo={goTo}
        emitEvent={emitEvent}
      />
    );
  }

  if (route.name === "detail") {
    return (
      <PaymentDetailPage
        basePath={basePath ?? "/cbms"}
        paymentId={route.paymentId}
        currentPage={route.page}
        goTo={goTo}
        emitEvent={emitEvent}
      />
    );
  }

  return (
    <PaymentsListPage
      basePath={basePath ?? "/cbms"}
      currentPage={route.page}
      goTo={goTo}
      onEvent={onEvent}
    />
  );
};

export default CbmsApp;
