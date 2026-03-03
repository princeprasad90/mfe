import React, { useMemo } from "react";
import "./cdts.css";

type Props = {
  routePath?: string;
  basePath?: string;
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
  routePath = `${window.location.pathname}${window.location.search}`,
  basePath = "/tasks"
}: Props) => {
  const detailMatch = routePath.match(/\/details\/(\d+)/);
  const detailId = detailMatch ? Number(detailMatch[1]) : null;
  const detailTask = tasks.find((item) => item.id === detailId);

  const pageMatch = routePath.match(/[?&]page=(\d+)/);
  const currentPage = Math.max(1, Number(pageMatch?.[1] || 1));
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const goTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (detailTask) {
    return (
      <div className="mfe">
        <h2>Task Details</h2>
        <p><strong>ID:</strong> {detailTask.id}</p>
        <p><strong>Title:</strong> {detailTask.title}</p>
        <p><strong>Owner:</strong> {detailTask.owner}</p>
        <p><strong>Priority:</strong> {detailTask.priority}</p>
        <button className="mfe__button" onClick={() => goTo(`${basePath}?page=${currentPage}`)}>Back to Listing</button>
      </div>
    );
  }

  return (
    <div className="mfe">
      <h2>Tasks Listing</h2>
      <ul className="mfe__list">
        {pagedItems.map((task) => (
          <li key={task.id} className="mfe__list-item">
            <span>{task.title}</span>
            <button className="mfe__ghost" onClick={() => goTo(`${basePath}/details/${task.id}?page=${currentPage}`)}>Details</button>
          </li>
        ))}
      </ul>
      <div className="mfe__pager">
        <button className="mfe__ghost" disabled={currentPage <= 1} onClick={() => goTo(`${basePath}?page=${currentPage - 1}`)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="mfe__ghost" disabled={currentPage >= totalPages} onClick={() => goTo(`${basePath}?page=${currentPage + 1}`)}>Next</button>
      </div>
    </div>
  );
};

export default CdtsApp;
