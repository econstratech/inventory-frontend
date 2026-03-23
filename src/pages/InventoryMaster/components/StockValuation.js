// components/StockValuation.js
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const palette = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#0891b2', '#22c55e', '#f97316'];

const StockValuation = ({ rows = [], loading = false }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ label: 'Stock Valuation', data: [], backgroundColor: [] }],
  });

  useEffect(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    setData({
      labels: safeRows.map((row) => row.item_name || row.item_id || 'N/A'),
      datasets: [{
        label: 'Stock Valuation',
        data: safeRows.map((row) => Number(row.total_stock_value) || 0),
        backgroundColor: safeRows.map((_, index) => palette[index % palette.length]),
        borderWidth: 1,
      }],
    });
  }, [rows]);

  return (
    <div className="card h-100 shadow-sm mb-0">
      <div className="card-body">
        <div style={{ height: '400px' }}>
          {loading ? (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              Loading chart...
            </div>
          ) : data.labels.length > 0 ? (
            <Doughnut data={data} />
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              No stock valuation data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockValuation;
