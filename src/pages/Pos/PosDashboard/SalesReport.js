import React, { useState, useEffect, useMemo } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { PrivateAxios, PrivateAxiosFile } from '../../../environment/AxiosInstance';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

 // Adjust your import path accordingly

function SalesReport() {
  const [selectedFilter, setSelectedFilter] = useState("3"); // Default: This Month
  const [dataState, setDataState] = useState({ skip: 0, take: 5, sort: [] });
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Fetch orders with items from your API
    PrivateAxios.get("/pos/getAllOrdersWithItems")
      .then(res => setTableData(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter data to only show delivered items + filter by date
  const filteredData = useMemo(() => {
    if (!tableData.length) return [];

    const now = dayjs();

    return tableData.filter(item => {
      if (item.item_status !== 1) return false; // Only delivered items

      const createdAt = dayjs(item.created_at);

      switch (selectedFilter) {
        case "1": // Today
          return createdAt.isSame(now, 'day');
        case "2": { // This Week (ISO week)
          const startOfWeek = now.startOf('week');
          const endOfWeek = now.endOf('week');
          return createdAt.isSameOrAfter(startOfWeek) && createdAt.isSameOrBefore(endOfWeek);
        }
        case "3": { // This Month
          const startOfMonth = now.startOf('month');
          const endOfMonth = now.endOf('month');
          return createdAt.isSameOrAfter(startOfMonth) && createdAt.isSameOrBefore(endOfMonth);
        }
        case "4": { // This Year
          const startOfYear = now.startOf('year');
          const endOfYear = now.endOf('year');
          return createdAt.isSameOrAfter(startOfYear) && createdAt.isSameOrBefore(endOfYear);
        }
        default:
          return true;
      }
    });
  }, [tableData, selectedFilter]);

  // Apply pagination, sorting, filtering for Kendo Grid
  const processedData = process(filteredData, dataState);

  const handleDataStateChange = (e) => {
    setDataState(e.dataState);
  };

  return (
    <div className='card'>
      <div className='card-header d-flex align-items-center flex-wrap gap-2'>
        <select
          className='form-select w-auto'
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="1">Today</option>
          <option value="2">This Week</option>
          <option value="3">This Month</option>
          <option value="4">This Year</option>
        </select>
        <h5 className='card-title mb-0 ms-2'>Sales Report</h5>
      </div>

      <div className='card-body p-0'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='table-responsive mb-0'>
              <Grid
                data={processedData}
                {...dataState}
                onDataStateChange={handleDataStateChange}
                pageable={{ pageSizes: [5, 10, 20], buttonCount: 5 }}
                sortable={true}
                filterable={true}
                style={{ width: '100%' }}
              >
                <GridColumn
                  field="customer_name"
                  title="Customer Name"
                  width="200px"
                  headerClassName="fw-bold"
                />
                <GridColumn
                  field="product_name"
                  title="Item"
                  width="200px"
                  headerClassName="fw-bold"
                  cell={(props) => (
                    <td>
                      <div>Item: <span className='fw-bold'>{props.dataItem.product_name}</span></div>
                      <div>Code: <span className='fw-bold'>{props.dataItem.product_code}</span></div>
                    </td>
                  )}
                />
                <GridColumn
                  field="quantity"
                  title="Quantity"
                  width="100px"
                  headerClassName="fw-bold"
                />
                <GridColumn
                  field="item_total"
                  title="Amount"
                  width="100px"
                  headerClassName="fw-bold text-end"
                  cell={(props) => (
                    <td className="text-end">₹ {props.dataItem.item_total?.toFixed(2)}</td>
                  )}
                />
                <GridColumn
                  field="custom_order_id"
                  title="Order No."
                  width="150px"
                  headerClassName="fw-bold"
                />
                <GridColumn
                  field="created_at"
                  title="Order Date"
                  width="120px"
                  headerClassName="fw-bold"
                  cell={(props) => (
                    <td>{new Date(props.dataItem.created_at).toLocaleDateString()}</td>
                  )}
                />
              </Grid>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesReport;
