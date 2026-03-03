const container = document.getElementById("root");

if (container) {
  void import("./bootstrap").then((module) =>
    module.mount(container, {
      routePath: `${window.location.pathname}${window.location.search}`,
      basePath: "/products"
    })
  );
}
