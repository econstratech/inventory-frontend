import React, { useEffect, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

ChartJS.register(ArcElement, Tooltip, Legend);

function VendorPerformanceReport() {
  const [gridData, setGridData] = useState([]);
  const [filter, setFilter] = useState({ logic: "and", filters: [] });

  const fetchData = async () => {
    try {
      const response = await PrivateAxios.get('/purchase/vendorperformance');
      const raw = response.data.data || [];

      // Map API data to grid format
      const mapped = raw.map((item, index) => ({
        id: index + 1,
        vendorName: item.vendor?.vendor_name || 'Unknown',
        averageDelay: Math.round(item.average_delay_days), // number of days as int
        totalPurchase: item.total_purchase
      }));

      setGridData(mapped);
    } catch (error) {
      console.error('Error fetching vendor performance:', error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare doughnut chart data
  const doughnutData = {
    labels: gridData.map(item => item.vendorName),
    datasets: [
      {
        data: gridData.map(item => item.averageDelay),
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }
    ]
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className='p-4'>
      <div className='mb-3'>
        <Button
          className="btn link-btn text-dark"
          onClick={() => window.history.back()}
          startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}
        >
          Back
        </Button>
      </div>

      <div className='card'>
        <div className='card-header'>
          <h4 className='card-title mb-0'>Vendor Performance Report (Average Delay)</h4>
        </div>
        <div className='card-body'>
          <div className='row'>
            <div className='col-lg-8'>
              <div className='table-responsive'>
                <Grid
                  data={process(gridData, { filter })}
                  filterable={true}
                  filter={filter}
                  onFilterChange={e => setFilter(e.filter)}
                  style={{ width: '100%' }}
                >
                  <GridColumn
                    field="id"
                    title="#"
                    filterable={false}
                    width="80px"
                    headerStyle={{ minWidth: '80px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="vendorName"
                    title="Vendor Name"
                    filterable={true}
                    width="200px"
                    headerStyle={{ minWidth: '200px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="averageDelay"
                    title="Average Delay (days)"
                    filterable={true}
                    width="180px"
                    headerStyle={{ minWidth: '180px' }}
                    headerClassName="fw-bold"
                  />
                  <GridColumn
                    field="totalPurchase"
                    title="Total Purchase"
                    filterable={false}
                    width="150px"
                    headerStyle={{ minWidth: '150px' }}
                    headerClassName="fw-bold"
                    cell={props => (
                        <td>
                        ₹ {props.dataItem.totalPurchase?.toLocaleString('en-IN') || '0'}
                        </td>
                    )}
                    />
                </Grid>
              </div>
            </div>

            <div className='col-lg-4 mt-4 mt-lg-0'>
              <div className='card h-100'>
                <div className='card-header'>
                  <h5 className='card-title mb-0 text-center'>Delay Distribution</h5>
                </div>
                <div className='card-body d-flex flex-column'>
                  <div className='chart-pie pt-4 pb-2' style={{ height: '300px' }}>
                    <Doughnut
                      data={doughnutData}
                      options={doughnutOptions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorPerformanceReport;
