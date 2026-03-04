import { Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { PrivateAxios } from '../../../environment/AxiosInstance';
import moment from 'moment';

const InventoryOverview = () => {
  const [overview, setOverview] = useState({ totalItems: 0, totalValuation: 0 });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOverview = () => {
    PrivateAxios.get('/product/inventory/overview')
      .then((res) => {
        setOverview(res.data);
        setLastUpdated(moment()); // set current time
      })
      .catch((err) => {
        console.error('Failed to fetch inventory overview', err);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  return (
    <div className="card shadow-none border">
      <div className="card-body pb-0 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="text-muted">Last updated:</span>{' '}
            {lastUpdated ? lastUpdated.format('h:mm A, DD MMM YYYY') : 'Loading...'}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-primary p-0"
            onClick={fetchOverview}
          >
            Refresh <i className="fas fa-redo ms-2"></i>
          </button>
        </div>

        <div className="table-responsive">
          <table className="table-bordered primary-table-head table">
            <thead>
              <tr>
                <th></th>
                <th>Value</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span>Stock Valuation (By FIFO)</span>
                  <Tooltip title="FIFO stock valuation assumes oldest inventory sold first">
                    <i className="fas fa-info-circle text-primary ms-2"></i>
                  </Tooltip>
                </td>
                <td>{formatCurrency(overview.totalValuation)}</td>
                <td>{overview.totalItems}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;
