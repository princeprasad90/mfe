import React from "react";
import "./cbms.css";
import { useMfeRouter } from "@mfe/platform-ui";
import { cbmsRoutes } from "./routes";
import PaymentsListPage from "./pages/list/PaymentsListPage";
import PaymentDetailPage from "./pages/detail/PaymentDetailPage";
import CreatePaymentPage from "./pages/create/CreatePaymentPage";
import FormBuilderDemoPage from "./pages/demo/FormBuilderDemoPage";

// Props injected by the Shell via mount() — mirrors @mfe/platform-contracts MountProps
type Props = {
  basePath?: string;
  routePath?: string;
  user?: { id: string; email: string; displayName: string };
  emitEvent?: <T>(event: string, detail: T) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
};

const CbmsApp = ({ basePath = "/cbms", emitEvent, onEvent }: Props) => {
  const { route, navigate } = useMfeRouter({
    basePath,
    routes: cbmsRoutes,
  });

  if (route.name === "demo") {
    return (
      <FormBuilderDemoPage
        basePath={basePath ?? "/cbms"}
        goTo={navigate}
      />
    );
  }

  if (route.name === "create") {
    return (
      <CreatePaymentPage
        basePath={basePath ?? "/cbms"}
        goTo={navigate}
        emitEvent={emitEvent}
      />
    );
  }

  if (route.name === "detail") {
    return (
      <PaymentDetailPage
        basePath={basePath ?? "/cbms"}
        paymentId={(route.params.id as number) || 0}
        currentPage={Math.max(1, (route.query.page as number) || 1)}
        goTo={navigate}
        emitEvent={emitEvent}
      />
    );
  }

  return (
    <PaymentsListPage
      basePath={basePath ?? "/cbms"}
      currentPage={Math.max(1, (route.query.page as number) || 1)}
      goTo={navigate}
      onEvent={onEvent}
    />
  );
};

export default CbmsApp;
