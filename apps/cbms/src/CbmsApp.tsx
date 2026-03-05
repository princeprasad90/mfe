import React, { useMemo, useState, useEffect } from "react";
import "./cbms.css";

type Props = {
  routePath?: string;
  basePath?: string;
};

type Payment = { id: number; customer: string; amount: number; status: string };

// Shell event helpers (inline for demo, could use notification-sdk package)
const shellNotify = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
  window.dispatchEvent(new CustomEvent('mfe:notification', { detail: { type, title, message, duration: 4000 } }));
};

const showLoader = (key: string = 'cbms') => {
  window.dispatchEvent(new CustomEvent('mfe:loading:start', { detail: { key } }));
};

const hideLoader = (key: string = 'cbms') => {
  window.dispatchEvent(new CustomEvent('mfe:loading:stop', { detail: { key } }));
};

const PAGE_SIZE = 5;
const payments: Payment[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  amount: 500 + (index + 1) * 35,
  status: index % 2 === 0 ? "Pending" : "Approved"
}));

const CbmsApp = ({
  basePath = "/cbms"
}: Props) => {
  const [currentUrl, setCurrentUrl] = useState(`${window.location.pathname}${window.location.search}`);

  useEffect(() => {
    const handlePopstate = () => {
      setCurrentUrl(`${window.location.pathname}${window.location.search}`);
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  const routePath = currentUrl;
  const detailMatch = routePath.match(/\/details\/(\d+)/);
  const detailId = detailMatch ? Number(detailMatch[1]) : null;
  const detailItem = payments.find((item) => item.id === detailId);

  const pageMatch = routePath.match(/[?&]page=(\d+)/);
  const currentPage = Math.max(1, Number(pageMatch?.[1] || 1));
  const totalPages = Math.ceil(payments.length / PAGE_SIZE);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return payments.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const goTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (detailItem) {
    return (
      <div className="mfe">
        <h2>Payment Details</h2>
        <p><strong>ID:</strong> {detailItem.id}</p>
        <p><strong>Customer:</strong> {detailItem.customer}</p>
        <p><strong>Amount:</strong> ${detailItem.amount}</p>
        <p><strong>Status:</strong> {detailItem.status}</p>
        <button className="button" onClick={() => goTo(`${basePath}?page=${currentPage}`)}>Back to Listing</button>
      </div>
    );
  }

  return (
    <div className="mfe">
      <h2>Payments Listing</h2>
      <ul className="list">
        {pagedItems.map((payment) => (
          <li key={payment.id} className="list-item">
            <span>{payment.customer} - ${payment.amount}</span>
            <button className="ghost" onClick={() => goTo(`${basePath}/details/${payment.id}?page=${currentPage}`)}>Details</button>
          </li>
        ))}
      </ul>
      <div className="pager">
        <button className="ghost" disabled={currentPage <= 1} onClick={() => goTo(`${basePath}?page=${currentPage - 1}`)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="ghost" disabled={currentPage >= totalPages} onClick={() => goTo(`${basePath}?page=${currentPage + 1}`)}>Next</button>
      </div>

      {/* Demo: Shell Integration Features */}
      <div className="demo-section">
        <h3>Shell Integration Demo</h3>
        <div className="demo-row">
          <span className="demo-label">Notifications:</span>
          <button className="button button--success" onClick={() => shellNotify('success', 'Success!', 'Payment processed successfully.')}>
            Success
          </button>
          <button className="button button--error" onClick={() => shellNotify('error', 'Error', 'Payment failed. Please try again.')}>
            Error
          </button>
          <button className="button button--warning" onClick={() => shellNotify('warning', 'Warning', 'Session will expire in 5 minutes.')}>
            Warning
          </button>
          <button className="button button--info" onClick={() => shellNotify('info', 'Info', 'New features are available.')}>
            Info
          </button>
        </div>
        <div className="demo-row">
          <span className="demo-label">Loading:</span>
          <button className="button" onClick={() => { showLoader(); setTimeout(hideLoader, 2000); }}>
            Show Loader (2s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CbmsApp;
