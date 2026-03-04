// components/InventoryPerformance.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { PrivateAxios } from '../../../environment/AxiosInstance';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InventoryPerformance = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    PrivateAxios.get('/product/inventory/performance')
      .then(res => {
        const { labels, datasets } = res.data;

        setChartData({
          labels,
          datasets: [
            {
              label: 'Inward',
              data: datasets.Inward,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              fill: false,
              tension: 0.4,
            },
            {
              label: 'Outward',
              data: datasets.Outward,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              fill: false,
              tension: 0.4,
            },
          ],
        });
      })
      .catch(err => {
        console.error('Failed to load inventory performance', err);
      });
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="card">
      <div className='card-header border-0 d-flex align-items-center gap-2'>
        <h5 className="card-title">Inventory Performance</h5>
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="bottom"
          overlay={
            <Popover id="my-kpi-help" className="unique-outer-wrap">
              <div className='unique-outer-wrap'>
                <div className='exp-popover-wrap'>
                  <h5>How we calculate Inventory Performance?</h5>
                  <p className='exp-task-details-item'>
                    <span className='exp-task-details-name'>Inward:</span> Items added to inventory (e.g., PO received)
                  </p>
                  <p className='exp-task-details-item'>
                    <span className='exp-task-details-name'>Outward:</span> Items removed from inventory (e.g., Issued to production, dispatch)
                  </p>
                </div>
              </div>
            </Popover>
          }
        >
          <span className="cursor-pointer text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill='currentColor'>
              <path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,20a1,1,0,1,1,1-1A1,1,0,0,1,12,20Zm1.93-7.494A1.982,1.982,0,0,0,13,14.257V15a1,1,0,0,1-2,0v-.743a3.954,3.954,0,0,1,1.964-3.5,2,2,0,0,0,1-2.125,2.024,2.024,0,0,0-1.6-1.595A2,2,0,0,0,10,9,1,1,0,0,1,8,9a4,4,0,1,1,5.93,3.505Z" />
            </svg>
          </span>
        </OverlayTrigger>
      </div>

      <div className="card-body pt-1">
        <div className="card shadow-sm mt-3 mb-0">
          <div className="card-body p-0">
            <ul className="nav nav-tabs gth-tabs gth-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="week-file-tab" data-bs-toggle="tab" data-bs-target="#week-file" type="button" role="tab">Week on Week</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="month-file-tab" data-bs-toggle="tab" data-bs-target="#month-file" type="button" role="tab">Month on Month</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="quarter-file-tab" data-bs-toggle="tab" data-bs-target="#quarter-file" type="button" role="tab">Quarter on Quarter</button>
              </li>
            </ul>

            <div className="tab-content pt-2" id="myTabContent">
              <div className="tab-pane fade show active py-3" id="week-file" role="tabpanel">
                <div style={{ height: '300px' }}>
                  {chartData ? <Line data={chartData} options={options} /> : <p className="text-center">Loading chart...</p>}
                </div>
              </div>
              <div className="tab-pane fade py-3" id="month-file" role="tabpanel">
                <div style={{ height: '300px' }}>
                  {chartData ? <Line data={chartData} options={options} /> : <p className="text-center">Loading chart...</p>}
                </div>
              </div>
              <div className="tab-pane fade py-3" id="quarter-file" role="tabpanel">
                <div style={{ height: '300px' }}>
                  {chartData ? <Line data={chartData} options={options} /> : <p className="text-center">Loading chart...</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPerformance;
