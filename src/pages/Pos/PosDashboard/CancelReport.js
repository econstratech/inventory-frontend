import React, { useState, useEffect, useMemo } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { PrivateAxios } from '../../../environment/AxiosInstance';
dayjs.extend(isoWeek);

function CancelReport() {
  const [selectedFilter, setSelectedFilter] = useState("3"); // Default: This Month
  const [dataState, setDataState] = useState({ skip: 0, take: 5, sort: [] });
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    PrivateAxios.get("/pos/getAllOrdersWithItems")
      .then(res => setTableData(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter items with item_status === 2 and by selected date filter
  const filteredData = useMemo(() => {
    if (!tableData.length) return [];

    const now = dayjs();

    return tableData.filter(item => {
      // Filter only items with item_status === 2
      if (item.item_status !== 2) return false;

      const orderDate = dayjs(item.created_at);

      switch (selectedFilter) {
        case "1": // Today
          return orderDate.isSame(now, 'day');
        case "2": // This Week (ISO week)
          return orderDate.isoWeek() === now.isoWeek() && orderDate.isSame(now, 'year');
        case "3": // This Month
          return orderDate.isSame(now, 'month');
        case "4": // This Year
          return orderDate.isSame(now, 'year');
        default:
          return true;
      }
    });
  }, [tableData, selectedFilter]);

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
        <h5 className='card-title mb-0 ms-2'>Cancelled Report </h5>
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
                  field="created_at"
                  title="Order Date"
                  width="120px"
                  headerClassName="fw-bold"
                  cell={(props) => (
                    <td>{new Date(props.dataItem.created_at).toLocaleDateString()}</td>
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
              </Grid>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CancelReport;
