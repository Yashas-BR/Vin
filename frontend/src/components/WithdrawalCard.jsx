import React from 'react';

export default function WithdrawalCard({ medicine }) {
  if (!medicine) return null;

  return (
    <div className="withdrawal-info">
      <div className="withdrawal-row">
        <span className="label">Withdrawal (Milk):</span>
        <span className="value">{medicine.withdrawal_days_milk} days</span>
      </div>
      <div className="withdrawal-row">
        <span className="label">Withdrawal (Meat):</span>
        <span className="value">{medicine.withdrawal_days_meat} days</span>
      </div>
      <div className="withdrawal-row">
        <span className="label">Environmental Risk:</span>
        <span className={`badge badge-${medicine.environmental_risk}`}>
          {medicine.environmental_risk}
        </span>
      </div>
    </div>
  );
}

const withdrawalStyles = `
.withdrawal-info {
  margin: 1rem 0;
  padding: 1rem;
  background-color: var(--background);
  border-radius: 6px;
  border-left: 4px solid var(--green-mid);
}

.withdrawal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.withdrawal-row:last-child {
  margin-bottom: 0;
}

.withdrawal-row .label {
  font-weight: 600;
  color: var(--text-primary);
}

.withdrawal-row .value {
  color: var(--text-secondary);
}

.badge-low {
  background-color: var(--green-light);
  color: var(--green-dark);
}

.badge-medium {
  background-color: var(--amber-light);
  color: var(--amber);
}

.badge-high {
  background-color: var(--red-light);
  color: var(--red);
}
`;
