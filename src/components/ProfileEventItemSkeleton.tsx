import React from 'react'

export function ProfileEventItemSkeleton() {
  return (
    <div className="profile-event-item profile-event-item-skeleton">
      <div className="profile-event-content">
        <div className="skeleton skeleton-title" />
        <div className="profile-event-meta">
          <div className="skeleton skeleton-meta" />
          <div className="skeleton skeleton-meta" />
        </div>
      </div>
      <div className="skeleton skeleton-arrow" />
    </div>
  )
}
