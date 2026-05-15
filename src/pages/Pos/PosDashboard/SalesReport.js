import React, { useState, useEffect, useMemo } from 'react';
import { Table } from 'antd';
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';
import { PrivateAxios } from '../../../environment/AxiosInstance';

const getDateRange = (filter) => {
  const now = dayjs();
  switch (filter) {
    case "1":
      return { date_from: now.startOf('day'), date_to: now.endOf('day') };
    case "2":
      return { date_from: now.startOf('week'), date_to: now.endOf('week') };
    case "3":
      return { date_from: now.startOf('month'), date_to: now.endOf('month') };
    case "4":
      return { date_from: now.startOf('year'), date_to: now.endOf('year') };
    default:
      return { date_from: null, date_to: null };
  }
};

const fmt = (d) => (d ? d.format('YYYY-MM-DD HH:mm:ss') : null);

function SalesReport() {
  const [selectedFilter, setSelectedFilter] = useState("3"); // Default: This Month
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const queryParams = useMemo(() => {
    const { date_from, date_to } = getDateRange(selectedFilter);
    return {
      page: pagination.current,
      limit: pagination.pageSize,
      status: 1, // Delivered
      date_from: fmt(date_from),
      date_to: fmt(date_to),
    };
  }, [selectedFilter, pagination.current, pagination.pageSize]);

  useEffect(() => {
    setLoading(true);
    PrivateAxios.get("/pos/getAllOrdersWithItems", { params: queryParams })
      .then((res) => {
        const data = res.data?.data || {};
        const rows = (data.rows || []).map((item, idx) => ({
          ...item,
          _key: `${item.order_item_id ?? item.id ?? idx}-${idx}`,
        }));
        setTableData(rows);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total_records || 0,
        }));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [queryParams]);

  // Reset to page 1 when filter changes.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [selectedFilter]);

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 200,
    },
    {
      title: 'Item',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      render: (_, record) => (
        <>
          <div>Item: <span className='fw-bold'>{record.product_name}</span></div>
          <div>Code: <span className='fw-bold'>{record.product_code}</span></div>
        </>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Amount',
      dataIndex: 'item_total',
      key: 'item_total',
      width: 100,
      align: 'right',
      render: (val) => `₹ ${Number(val || 0).toFixed(2)}`,
    },
    {
      title: 'Order No.',
      dataIndex: 'custom_order_id',
      key: 'custom_order_id',
      width: 150,
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '-'),
    },
  ];

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
              <Table
                rowKey={(record) => record._key}
                columns={columns}
                dataSource={tableData}
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} items`,
                }}
                onChange={(p) =>
                  setPagination((prev) => ({
                    ...prev,
                    current: p.current,
                    pageSize: p.pageSize,
                  }))
                }
                scroll={{ x: 'max-content' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesReport;
