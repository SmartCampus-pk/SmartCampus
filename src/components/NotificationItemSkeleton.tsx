import React from 'react'

export function NotificationItemSkeleton() {
  return (
    <div className="notification-item notification-item-skeleton">
      <div className="notification-content">
        <div className="notification-header">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-badge" />
        </div>
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description skeleton-description-short" />
        <div className="notification-meta">
          <div className="skeleton skeleton-meta" />
          <div className="skeleton skeleton-meta" />
        </div>
      </div>
    </div>
  )
}
