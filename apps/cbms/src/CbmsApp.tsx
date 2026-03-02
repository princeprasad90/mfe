import React, { useMemo } from "react";
import "./cbms.css";

type Props = {
  routePath?: string;
  basePath?: string;
};

type Payment = { id: number; customer: string; amount: number; status: string };

const PAGE_SIZE = 5;
const payments: Payment[] = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  customer: `Customer ${index + 1}`,
  amount: 500 + (index + 1) * 35,
  status: index % 2 === 0 ? "Pending" : "Approved"
}));

const CbmsApp = ({ routePath = "/payments", basePath = "/payments" }: Props) => {
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
    window.location.hash = `#${path}`;
  };

  if (detailItem) {
    return (
      <div className="mfe">
        <h2>Payment Details</h2>
        <p><strong>ID:</strong> {detailItem.id}</p>
        <p><strong>Customer:</strong> {detailItem.customer}</p>
        <p><strong>Amount:</strong> ${detailItem.amount}</p>
        <p><strong>Status:</strong> {detailItem.status}</p>
        <button className="mfe__button" onClick={() => goTo(`${basePath}?page=${currentPage}`)}>Back to Listing</button>
      </div>
    );
  }

  return (
    <div className="mfe">
      <h2>Payments Listing</h2>
      <ul className="mfe__list">
        {pagedItems.map((payment) => (
          <li key={payment.id} className="mfe__list-item">
            <span>{payment.customer} - ${payment.amount}</span>
            <button className="mfe__ghost" onClick={() => goTo(`${basePath}/details/${payment.id}?page=${currentPage}`)}>Details</button>
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

export default CbmsApp;
