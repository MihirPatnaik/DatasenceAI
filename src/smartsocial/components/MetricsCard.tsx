//src/smartsocial/components/MetricsCard.tsx


import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  className?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  change,
  className = ''
}) => {
  return (
    <div className={`metrics-card ${className}`}>
      <div className="metrics-card-icon">{icon}</div>
      <div className="metrics-card-content">
        <h3 className="metrics-card-title">{title}</h3>
        <p className="metrics-card-value">{value}</p>
        {change && <span className="metrics-card-change">{change}</span>}
      </div>
    </div>
  );
};

export default MetricsCard;