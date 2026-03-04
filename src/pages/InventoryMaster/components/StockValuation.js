// components/StockValuation.js
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PrivateAxios } from '../../../environment/AxiosInstance';

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend);

const StockValuation = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ label: 'Stock Valuation', data: [], backgroundColor: [] }],
  });

  useEffect(() => {
    PrivateAxios.get('/product/inventory/stock-valuation').then((res) => {
      const { valuation } = res.data;

      setData({
        labels: valuation.map(v => v.item_name),
        datasets: [{
          label: 'Stock Valuation',
          data: valuation.map(v => v.stock_value),
          backgroundColor: valuation.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`)
        }]
      });
    });
  }, []);

  return (
    <div className="card h-100 shadow-sm mb-0">
      <div className="card-body">
        <div style={{ height: '400px' }}>
          <Doughnut data={data} />
        </div>
      </div>
    </div>
  );
};

export default StockValuation;
