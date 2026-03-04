import React, { useEffect, useState } from 'react'
import { Modal, Table } from 'react-bootstrap';
// import { OverlayTrigger, Popover, Tab, Tabs, Tooltip } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Legend } from 'chart.js';
// import { Doughnut } from 'react-chartjs-2';
import { FaDownload, FaShoppingCart, FaUsers, FaChartPie } from 'react-icons/fa';
import '../Dashboard.css';
import RevenueChart from '../charts/RevenueChart';
import SegmentsChart from '../charts/SegmentsChart';
import CustomBarChart from '../charts/VendorChart';

import { PrivateAxios } from '../../environment/AxiosInstance';
// import CustomTable from './VendorMis';
import CustomLineChart from '../charts/CustomLineChart';
// import { UserContext } from '../routes/ProtectedRoute';
ChartJS.register(ArcElement, Legend);
//data workflow


const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Dashboard = () => {
  const [POStatusCount, setPOStatusCount] = useState({
    active_po_count: 0,
    pending_approval_count: 0,
    grn_pending_count: 0,
  });
  const [error, setError] = useState(null);
  const [monthlyPurchase, setMonthlyPurchase] = useState(null);
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [reportRows, setReportRows] = useState([]);
  const [reportPagination, setReportPagination] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const reportLimit = 10;

  const fetchMonthlyPurchaseReport = async (page = 1) => {
    setReportLoading(true);
    try {
      const response = await PrivateAxios.get(
        `report/monthly-purchase-report?page=${page}&limit=${reportLimit}`
      );
      const { data } = response.data || {};
      if (data) {
        setReportRows(data.rows || []);
        setReportPagination(data.pagination || null);
        setReportPage(page);
      }
    } catch (err) {
      setReportRows([]);
      setReportPagination(null);
    } finally {
      setReportLoading(false);
    }
  };

  const openMonthlyReportModal = () => {
    setShowMonthlyReportModal(true);
    fetchMonthlyPurchaseReport(1);
  };

  const fetchMonthlyPurchase = async () => {
    try {
      const response = await PrivateAxios.get('report/total-purchase-of-this-month');
      const { data } = response.data || {};
      if (data) {
        setMonthlyPurchase({
          total_purchase_amount: Math.round(data.total_purchase_amount ?? 0),
          month: data.month ?? new Date().getMonth() + 1,
          year: data.year ?? new Date().getFullYear(),
        });
      }
    } catch (err) {
      setMonthlyPurchase({
        total_purchase_amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
    }
  };

  const fetchStatusWisePOCount = async () => {
    try {
      const response = await PrivateAxios.get('report/status-wise-po-report');
      const responseData = response.data?.data || null;
      if (responseData) {
        setPOStatusCount(responseData);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchMonthlyPurchase();
    fetchStatusWisePOCount();
  }, []);


  return (
    <div className="container-fluid">
      <div className="row">

        {/* Main content */}
        <main className="col-md-12 ms-sm-auto col-lg-12 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">

          </div>

          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card warning-gredient mb-3">
                <div className="card-body">
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-start text-dark text-decoration-none w-100"
                    onClick={openMonthlyReportModal}
                  >
                    <div className="card-title fs-4">
                      {monthlyPurchase === null
                        ? '...'
                        : `₹ ${Number(monthlyPurchase.total_purchase_amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                    </div>
                    <div className="card-text">
                      <FaDownload style={{ marginBottom: '2px' }} /> In {monthlyPurchase === null
                        ? '...'
                        : `${MONTH_NAMES[(monthlyPurchase.month - 1)] || monthlyPurchase.month} ${monthlyPurchase.year}`}
                      <span className="ms-1 small text-primary">View report</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

      
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card danger-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{POStatusCount.active_po_count} Active PO</div>
                  <div className="card-text"><FaShoppingCart style={{ marginBottom: '2px', marginRight: '2px' }} /> 
                    Total Active POs
                    {/* {POStatusCount.active_po_count_percentage_change > 0 ? 
                    ` +${(POStatusCount.active_po_count_percentage_change).toFixed(2)}%` 
                    : (POStatusCount.active_po_count_percentage_change < 0 && POStatusCount.active_po_count_percentage_change > -100) ? ` -${(POStatusCount.active_po_count_percentage_change).toFixed(2)}%` : ' 0%'} 
                    from last month */}
                    </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card success-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{POStatusCount.pending_approval_count} Pending Approval</div>
                    <div className="card-text"><FaUsers style={{ marginBottom: '2px', marginRight: '2px' }} /> 
                      Total Pending Approvals
                      {/* {POStatusCount.pending_approval_count_percentage_change > 0 ? 
                      ` +${(POStatusCount.pending_approval_count_percentage_change).toFixed(2)}%` 
                      : (POStatusCount.pending_approval_count_percentage_change < 0 && POStatusCount.pending_approval_count_percentage_change > -100) 
                      ? ` -${(POStatusCount.pending_approval_count_percentage_change).toFixed(2)}%` 
                      : ' 0%'}  */}
                    </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card info-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{POStatusCount.grn_pending_count} GRN Pending</div>
                    <div className="card-text"><FaChartPie style={{ marginBottom: '2px', marginRight: '2px' }} /> 
                      Total GRN Pending
                      {/* {POStatusCount.grn_pending_count_percentage_change > 0 ? 
                      ` +${(POStatusCount.grn_pending_count_percentage_change).toFixed(2)}%` 
                      : (POStatusCount.grn_pending_count_percentage_change < 0 && POStatusCount.grn_pending_count_percentage_change > -100) 
                      ? ` -${(POStatusCount.grn_pending_count_percentage_change).toFixed(2)}%` : ' 0%'} 
                      from last month */}
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-8 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Vendor Performance (This Month)</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <CustomBarChart />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Status Wise PO Count</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <SegmentsChart />
                </div>
              </div>
            </div>
          
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Monthly Purchase</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <CustomLineChart />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Monthly Revenue</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <RevenueChart />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="row">
            <div className="col-12">
            <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary text-white">
            Vendor Report
            </div>
            <div className="card-body">
            <CustomTable />
                </div></div>
            </div>
          </div> */}

          <Modal
            show={showMonthlyReportModal}
            onHide={() => setShowMonthlyReportModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Monthly Purchase Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {reportLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <>
                  <Table responsive bordered hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Year</th>
                        <th>Month</th>
                        <th>Total Orders</th>
                        <th className="text-end">Total Purchase Amount</th>
                        <th>Total Completed Orders</th>
                        <th className="text-end">Total Completed Purchase Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportRows.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-4">
                            No records found
                          </td>
                        </tr>
                      ) : (
                        reportRows.map((row, idx) => (
                          <tr key={`${row.year}-${row.month}-${idx}`}>
                            <td>{row.year}</td>
                            <td>{MONTH_NAMES[(row.month - 1)] || row.month}</td>
                            <td>{row.total_po_count}</td>
                            <td className="text-end">
                              ₹ {Number(row.total_purchase_amount).toFixed(2)}
                            </td>
                            <td>{row.completed_po_count}</td>
                            <td className="text-end">
                              ₹ {Number(row.completed_total_po_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                  {reportPagination && (reportPagination.total_pages > 1 || reportPage > 1) && (
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 pt-2 border-top">
                      <small className="text-muted">
                        Page {reportPagination.current_page} of {reportPagination.total_pages}
                        {reportPagination.total_records != null && (
                          <> ({reportPagination.total_records} records)</>
                        )}
                      </small>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={!reportPagination.has_prev_page || reportLoading}
                          onClick={() => fetchMonthlyPurchaseReport(reportPagination.prev_page)}
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={!reportPagination.has_next_page || reportLoading}
                          onClick={() => fetchMonthlyPurchaseReport(reportPagination.next_page)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Modal.Body>
          </Modal>
        </main>
      </div>
    </div>

    
  );
};

export default Dashboard;