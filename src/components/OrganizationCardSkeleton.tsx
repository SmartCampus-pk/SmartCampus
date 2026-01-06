import React from 'react'

export function OrganizationCardSkeleton() {
  return (
    <div className="organization-card organization-card-skeleton">
      <div className="organization-logo skeleton skeleton-logo" />
      <div className="organization-content">
        <div className="organization-header">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-badge" />
        </div>
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description skeleton-description-short" />
        <div className="organization-contact">
          <div className="skeleton skeleton-contact" />
          <div className="skeleton skeleton-contact" />
        </div>
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  )
}
