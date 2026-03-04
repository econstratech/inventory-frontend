import React, { useEffect, useState } from 'react';
import { PrivateAxios } from '../../../environment/AxiosInstance';
import moment from 'moment';

const StockLevels = () => {
  const [stockData, setStockData] = useState({
    negative: 0,
    low: 0,
    reorder: 0,
    optimum: 0,
    high: 0,
    excess: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStockLevels = () => {
    PrivateAxios.get('/product/inventory/stock-levels')
      .then((res) => {
        setStockData(res.data);
        setLastUpdated(moment());
      })
      .catch((err) => {
        console.error('Failed to fetch stock levels', err);
      });
  };

  useEffect(() => {
    fetchStockLevels();
  }, []);

  const getTotal = () =>
    Object.values(stockData).reduce((acc, count) => acc + count, 0);

  const percent = (value) => {
    const total = getTotal();
    return total > 0 ? ((value / total) * 100).toFixed(0) : 0;
  };

  return (
    <>
      <div className="card">
        <div className="card-body pb-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 f-s-20 fw-bold">Stock Levels of Items in Inventory</h5>
            <div>
              <span className="text-muted">Last updated:</span>{' '}
              {lastUpdated ? lastUpdated.format('h:mm A, DD MMM YYYY') : 'Loading...'}
              <button
                type="button"
                className="btn btn-sm btn-link text-primary ms-2 p-0"
                onClick={fetchStockLevels}
              >
                Refresh <i className="fas fa-redo ms-1"></i>
              </button>
            </div>
          </div>

          <div className="row text-center">
            {[
              { key: 'negative', label: 'Negative Stock', style: 'danger' },
              { key: 'low', label: 'Low Stock', style: 'warning' },
              { key: 'reorder', label: 'Reorder Stock', style: 'active' },
              { key: 'optimum', label: 'Optimum Stock', style: 'meantGreen' },
              { key: 'high', label: 'High Stock', style: 'green' },
              { key: 'excess', label: 'Excess Stock', style: 'accent' },
            ].map((item) => (
              <div
                className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-12 mb-3"
                key={item.key}
              >
                <div className={`card h-100 shadow-sm card-outline-${item.style} mb-0`}>
                  <div className="card-body">
                    <h5 className="mb-3 fw-bold text-dark">{item.label}</h5>
                    <h4 className={`badge badge-outline-${item.style}`}>
                      <i className="ti ti-trending-up"></i>{' '}
                      {stockData[item.key]} ({percent(stockData[item.key])}%)
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockLevels;
