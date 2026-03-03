import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    async function loadProducts() {
      const remote = await import("productsAngular/bootstrap");
      const container = document.getElementById("mfe-root");

      if (container) {
        await remote.mount(container);
      }
    }

    void loadProducts();
  }, []);

  return (
    <div className="shell">
      <header className="shell__header">
        <h1>Shell</h1>
      </header>
      <main id="mfe-root" className="shell__content" />
    </div>
  );
}
