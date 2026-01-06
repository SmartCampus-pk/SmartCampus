import React from 'react'

export function EventCardSkeleton() {
  return (
    <div className="event-card event-card-skeleton">
      <div className="event-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description skeleton-description-short" />
        <div className="card-footer">
          <div className="skeleton skeleton-meta" />
          <div className="skeleton skeleton-meta" />
        </div>
      </div>
    </div>
  )
}
