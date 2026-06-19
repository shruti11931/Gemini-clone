import React from 'react'
import './Skeleton.css'

const Skeleton = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-nav">
        <div className="skeleton-box skeleton-title" />
        <div className="skeleton-circle" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton-box skeleton-greet-line1" />
        <div className="skeleton-box skeleton-greet-line2" />
        <div className="skeleton-cards">
          <div className="skeleton-box skeleton-card" />
          <div className="skeleton-box skeleton-card" />
          <div className="skeleton-box skeleton-card" />
          <div className="skeleton-box skeleton-card" />
        </div>
      </div>
    </div>
  )
}

export default Skeleton