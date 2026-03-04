import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PrivateAxios } from '../../environment/AxiosInstance';

ChartJS.register(ArcElement, Tooltip, Legend);

const SegmentsChart = () => {
  const [statusCounts, setStatusCounts] = useState({
    active_po_count: 0,
    pending_approval_count: 0,
    grn_pending_count: 0,
    approved_po_count: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('report/status-wise-po-report');
        const data = response.data?.data ?? {};
        setStatusCounts({
          active_po_count: Number(data.active_po_count) || 0,
          pending_approval_count: Number(data.pending_approval_count) || 0,
          grn_pending_count: Number(data.grn_pending_count) || 0,
          approved_po_count: Number(data.approved_po_count) || 0,
        });
      } catch (error) {
        console.error('Error fetching status-wise PO report:', error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ['Active PO', 'Pending Approval', 'GRN Pending', 'Approved PO'],
    datasets: [
      {
        data: [
          statusCounts.active_po_count,
          statusCounts.pending_approval_count,
          statusCounts.grn_pending_count,
          statusCounts.approved_po_count,
        ],
        backgroundColor: ['#e04040', '#68adde', '#ec8123', '#3ebc3e'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default SegmentsChart;
