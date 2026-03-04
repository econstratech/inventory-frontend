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

const CustomBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('report/vendor-wise-total-purchase-of-this-month');
        const raw = response.data?.data ?? [];
        const vendorData = raw
          .map((item) => ({
            name: item.vendor_name ?? '—',
            value: Number(item.total_purchase_amount) || 0,
          }))
          .sort((a, b) => b.value - a.value);
        setData(vendorData);
      } catch (error) {
        console.error('Error fetching vendor performance data:', error);
        setData([]);
      }
    };

    fetchData();
  }, []);

  // Custom color array (you can modify or expand it)
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
        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Total Purchase']} />
        <Bar dataKey="value" barSize={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
