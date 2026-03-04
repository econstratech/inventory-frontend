import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { PrivateAxios } from '../../environment/AxiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const RevenueChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('report/month-wise-revenue-report');
        const raw = response.data?.data ?? [];
        const sorted = [...raw].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return (a.month || 0) - (b.month || 0);
        });
        const labels = sorted.map((item) => `${MONTH_NAMES[Number(item.month) - 1] || item.month} ${item.year}`);
        const dataValues = sorted.map((item) => Number(item.revenue) || 0);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: dataValues,
              backgroundColor: '#3ebc3e',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setChartData({ labels: [], datasets: [] });
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Breakdown by Month',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default RevenueChart;
