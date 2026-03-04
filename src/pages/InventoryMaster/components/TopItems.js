// components/TopItems.js
import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { PrivateAxios } from '../../../environment/AxiosInstance';

const TopItems = () => {
  const [topSelling, setTopSelling] = useState([]);
  const [topPurchased, setTopPurchased] = useState([]);

  useEffect(() => {
    PrivateAxios.get('/product/inventory/top-items')
      .then(res => {
        setTopSelling(res.data.topSelling || []);
        setTopPurchased(res.data.topPurchased || []);
      })
      .catch(err => {
        console.error('Failed to fetch top items', err);
      });
  }, []);

  // Determine max row count
  const maxLength = Math.max(topSelling.length, topPurchased.length);

  return (
    <div className="card shadow-none border">
      <div className="card-body pb-0">
        <h5 className="card-title mb-3">Top 5 Selling and Purchased Items (Last 3 Months)</h5>
        <div className="table-responsive">
          <table className="table-bordered primary-table-head table">
            <thead>
              <tr>
                <th colSpan="3" className='text-center'>
                  <span>Top 5 Selling Items (Last 3 months)</span>
                  <Tooltip title="Calculated based on the traded volume of items in Invoice/Ad-hoc Invoice">
                    <i className="fas fa-info-circle text-primary ms-2"></i>
                  </Tooltip>
                </th>
                <th colSpan="3" className='text-center'>
                  <span>Top 5 Purchased Items (Last 3 months)</span>
                  <Tooltip title="Calculated based on the traded volume of items in Purchase Invoices">
                    <i className="fas fa-info-circle text-primary ms-2"></i>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th>Item Name</th>
                <th># Invoices</th>
                <th>Traded Amount</th>
                <th>Item Name</th>
                <th># Invoices</th>
                <th>Traded Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(maxLength)].map((_, i) => {
                const sell = topSelling[i] || {};
                const buy = topPurchased[i] || {};
                return (
                  <tr key={i}>
                    <td>{sell.item_name || ''}</td>
                    <td>{sell.invoice_count || ''}</td>
                    <td>{sell.traded_amount ? `₹${sell.traded_amount.toLocaleString()}` : ''}</td>
                    <td>{buy.item_name || ''}</td>
                    <td>{buy.invoice_count || ''}</td>
                    <td>{buy.traded_amount ? `₹${buy.traded_amount.toLocaleString()}` : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopItems;
