import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PrivateAxios } from '../../environment/AxiosInstance';

const CustomerPerformanceChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('report/customer-wise-total-sales-of-this-month');
        const raw = response.data?.data ?? [];
        const customerData = raw
          .map((item) => ({
            name: item.customer_name ?? '—',
            total_sales_amount: Number(item.total_sales_amount) || 0,
            total_sales_count: Number(item.total_sales_count) || 0,
          }))
          .sort((a, b) => b.total_sales_amount - a.total_sales_amount);
        setData(customerData);
      } catch (error) {
        console.error('Error fetching customer performance data:', error);
        setData([]);
      }
    };

    fetchData();
  }, []);

  // Custom color array (you can modify or expand it)
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
      <div className="recharts-default-tooltip" style={{ padding: '10px 14px', background: '#fff', border: '1px solid #ccc', borderRadius: 4 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0 }}>Total Sales Amount: ₹{Number(row.total_sales_amount || 0).toLocaleString('en-IN')}</p>
        <p style={{ margin: '4px 0 0' }}>Total Sales Count: {Number(row.total_sales_count || 0).toLocaleString('en-IN')}</p>
      </div>
    );
  };

  const customColors = [
    '#3289c7', // blue
    '#ec8123', // orange
    '#3ebc3e', // green
    '#e04040', // red
    '#a371d2', // purple
    '#b45f4e', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#b6b628', // lime
    '#2cafbe'  // cyan
  ];

  return (
    <ResponsiveContainer width="100%" height={535}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={180} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_sales_amount" barSize={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomerPerformanceChart;
