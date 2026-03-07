import React, { useMemo } from "react";
import "./cdts.css";
import { useMfeRouter } from "@mfe/platform-ui";
import { cdtsRoutes, cdtsPath } from "./routes";

type Props = {
  routePath?: string;
  basePath?: string;
  user?: { id: string; email: string; displayName: string };
  emitEvent?: <T>(event: string, detail: T) => void;
  onEvent?: <T>(event: string, handler: (detail: T) => void) => () => void;
};

type Task = { id: number; title: string; owner: string; priority: string };

const PAGE_SIZE = 4;
const tasks: Task[] = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  title: `Verification Task ${index + 1}`,
  owner: `Analyst ${index % 6}`,
  priority: index % 3 === 0 ? "High" : "Normal"
}));

const CdtsApp = ({
  basePath = "/tasks",
  emitEvent,
}: Props) => {
  const { route, navigate } = useMfeRouter({
    basePath,
    routes: cdtsRoutes,
  });

  const detailId = route.name === "detail" ? (route.params.id as number) || null : null;
  const detailTask = tasks.find((item) => item.id === detailId);

  const currentPage = Math.max(1, (route.query.page as number) || 1);
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  // ─── Assign task to a CBMS customer ─────────────────────────────────────
  // Emits "cdts:task:assigned" so the CBMS payments list can highlight the customer.
  const handleAssign = (task: Task, customer: string) => {
    if (emitEvent) {
      emitEvent<{ taskId: number; customer: string }>("cdts:task:assigned", {
        taskId: task.id,
        customer,
      });
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  if (detailTask) {
    return (
      <div className="mfe">
        <h2>Task Details</h2>
        <p><strong>ID:</strong> {detailTask.id}</p>
        <p><strong>Title:</strong> {detailTask.title}</p>
        <p><strong>Owner:</strong> {detailTask.owner}</p>
        <p><strong>Priority:</strong> {detailTask.priority}</p>

        {/* Cross-MFE demo: assign this task to a CBMS customer */}
        <div style={{ margin: "16px 0", padding: "12px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" }}>
          <strong>Assign to Customer:</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {["Customer 1", "Customer 2", "Customer 3"].map((c) => (
              <button
                key={c}
                className="button button--info"
                onClick={() => handleAssign(detailTask, c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Clicking emits <code>cdts:task:assigned</code> — CBMS payments list highlights that customer.
          </p>
        </div>

        <button className="button" onClick={() => navigate(cdtsPath.list(currentPage))}>Back to Listing</button>
      </div>
    );
  }

  return (
    <div className="mfe">
      <h2>Tasks Listing</h2>
      <ul className="list">
        {pagedItems.map((task) => (
          <li key={task.id} className="list-item">
            <span>{task.title}</span>
            <button className="ghost" onClick={() => navigate(cdtsPath.detail(task.id, currentPage))}>Details</button>
          </li>
        ))}
      </ul>
      <div className="pager">
        <button className="ghost" disabled={currentPage <= 1} onClick={() => navigate(cdtsPath.list(currentPage - 1))}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="ghost" disabled={currentPage >= totalPages} onClick={() => navigate(cdtsPath.list(currentPage + 1))}>Next</button>
      </div>
    </div>
  );
};

export default CdtsApp;
