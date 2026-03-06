import React from "react";

type Props = {
  count?: number;
};

/**
 * Renders shimmer placeholder cards while applications are loading.
 * Drop-in replacement for the cards grid during loading state.
 */
export function SkeletonCards({ count = 6 }: Props) {
  return (
    <div className="content-area__skeleton-grid" aria-busy="true" aria-label="Loading applications">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--icon" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--desc" />
          <div className="skeleton skeleton--desc-short" />
        </div>
      ))}
    </div>
  );
}
