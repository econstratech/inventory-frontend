import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PrivateAxios } from '../../environment/AxiosInstance';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomLineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('report/monthly-purchase-report?page=1&limit=12');
        const apiData = response.data?.data;
        const rows = Array.isArray(apiData?.rows) ? apiData.rows : [];
        const sorted = [...rows].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
        const chartData = sorted.map((row) => ({
          name: `${MONTH_NAMES[(row.month - 1)] || row.month} ${row.year}`,
          amount: Number(row.total_purchase_amount) || 0,
        }));
        setData(chartData);
      } catch (error) {
        console.error('Error fetching monthly purchase data:', error);
        setData([]);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `₹ ${(value / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value) => [`₹ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`, 'Amount']}
          labelFormatter={(label) => label}
        />
        <Legend />
        <Line type="monotone" dataKey="amount" name="Purchase" stroke="#ff7300" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
