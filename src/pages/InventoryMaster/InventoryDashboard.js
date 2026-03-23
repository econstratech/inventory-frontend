import React, { useEffect, useState } from 'react';
import moment from 'moment';

import InventoryOverview from './components/InventoryOverview';
import TopItems from './components/TopItems';
// import StockLevels from './components/StockLevels';
import InventoryPerformance from './components/InventoryPerformance';
import StockValuation from './components/StockValuation';
import { OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { PrivateAxios } from '../../environment/AxiosInstance';

const Dashboard = () => {

  const [isVisible, setIsVisible] = useState(true);
  const [isStockCountsVisible, setIsStockCountsVisible] = useState(true);
  const [inventoryOverview, setInventoryOverview] = useState({
    totalItems: 0,
    totalValuation: 0,
  });
  const [inventoryOverviewLastUpdated, setInventoryOverviewLastUpdated] = useState(null);
  const [stockColourCounts, setStockColourCounts] = useState({
    black: 0,
    red: 0,
    yellow: 0,
    green: 0,
    cyan: 0,
  });
  const [stockCountsLoading, setStockCountsLoading] = useState(false);
  const [stockCountsLastUpdated, setStockCountsLastUpdated] = useState(null);
  const [activeStockValuationType, setActiveStockValuationType] = useState('age');
  const [stockValuationRows, setStockValuationRows] = useState([]);
  const [stockValuationLoading, setStockValuationLoading] = useState(false);
  const [stockValuationLastUpdated, setStockValuationLastUpdated] = useState(null);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const formatCurrency = (value) => {
    const numericValue = Number(value) || 0;
    if (numericValue >= 10000000) {
      return `₹${(numericValue / 10000000).toFixed(2)} Cr`;
    } else if (numericValue >= 100000) {
      return `₹${(numericValue / 100000).toFixed(2)} L`;
    }
    return `₹${numericValue.toLocaleString()}`;
  };

  const handleOverviewUpdate = ({ overview, lastUpdated }) => {
    setInventoryOverview({
      totalItems: overview?.totalItems || 0,
      totalValuation: overview?.totalValuation || 0,
    });
    setInventoryOverviewLastUpdated(lastUpdated || null);
  };

  const stockCountCards = [
    {
      key: 'black',
      title: 'Critical',
      subtitle: 'Immediate reorder',
      accent: '#111827',
      glow: 'rgba(17, 24, 39, 0.18)',
      textColor: '#111827',
      icon: 'fas fa-radiation-alt',
    },
    {
      key: 'red',
      title: 'Very Low',
      subtitle: 'Running out soon',
      accent: '#dc2626',
      glow: 'rgba(220, 38, 38, 0.18)',
      textColor: '#991b1b',
      icon: 'fas fa-arrow-down',
    },
    {
      key: 'yellow',
      title: 'Low',
      subtitle: 'Monitor closely',
      accent: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.18)',
      textColor: '#92400e',
      icon: 'fas fa-exclamation-triangle',
    },
    {
      key: 'green',
      title: 'Good',
      subtitle: 'Healthy stock',
      accent: '#16a34a',
      glow: 'rgba(22, 163, 74, 0.18)',
      textColor: '#166534',
      icon: 'fas fa-check-circle',
    },
    {
      key: 'cyan',
      title: 'Overstock',
      subtitle: 'Above ideal level',
      accent: '#0891b2',
      glow: 'rgba(8, 145, 178, 0.18)',
      textColor: '#155e75',
      icon: 'fas fa-boxes',
    },
  ];

  const stockValuationTabs = [
    {
      key: 'age',
      label: 'Age',
      title: 'How we calculate Stock Valuation? (Age)',
      description: [
        {
          label: 'Stock Valuation',
          text: 'Based on FIFO pricing',
        },
        {
          label: 'Age',
          text: 'Calculated based on the duration inventory has been held in stock.',
        },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      title: 'How we calculate Stock Valuation? (Category)',
      description: [
        {
          label: 'Stock Valuation',
          text: 'Based on FIFO pricing',
        },
        {
          label: 'Category',
          text: 'Items are grouped using the category assigned during product setup.',
        },
      ],
    },
    {
      key: 'store',
      label: 'Store',
      title: 'How we calculate Stock Valuation? (Store)',
      description: [
        {
          label: 'Stock Valuation',
          text: 'Based on FIFO pricing',
        },
        {
          label: 'Store',
          text: 'Items are grouped by warehouse/store where the stock is currently held.',
        },
      ],
    },
  ];

  const fetchStockColourCounts = async () => {
    try {
      setStockCountsLoading(true);
      const response = await PrivateAxios.get('inventory/stock-colour-counts');
      if (response?.data?.status && response?.data?.data) {
        setStockColourCounts({
          black: Number(response.data.data.black) || 0,
          red: Number(response.data.data.red) || 0,
          yellow: Number(response.data.data.yellow) || 0,
          green: Number(response.data.data.green) || 0,
          cyan: Number(response.data.data.cyan) || 0,
        });
        setStockCountsLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching stock colour counts:', error);
    } finally {
      setStockCountsLoading(false);
    }
  };

  const fetchStockValuation = async (type = activeStockValuationType) => {
    try {
      setStockValuationLoading(true);
      const response = await PrivateAxios.get('inventory/stock-valuation', {
        params: { type },
      });
      if (response?.data?.status && response?.data?.data) {
        setStockValuationRows(Array.isArray(response.data.data.rows) ? response.data.data.rows : []);
        setStockValuationLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching stock valuation:', error);
      setStockValuationRows([]);
    } finally {
      setStockValuationLoading(false);
    }
  };

  useEffect(() => {
    fetchStockColourCounts();
  }, []);

  useEffect(() => {
    fetchStockValuation(activeStockValuationType);
  }, [activeStockValuationType]);

  const activeStockValuationTab =
    stockValuationTabs.find((tab) => tab.key === activeStockValuationType) || stockValuationTabs[0];


  return (
    <div className="p-4">
      <div className='row'>
        <div className='col-12'>
          <div className='card mb-4 border-0 shadow-sm overflow-hidden'>
            <div
              className='card-header border-0 d-flex justify-content-between align-items-center'
              style={{
                background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)',
                padding: '1rem 1.25rem',
              }}
            >
              <div>
                <h5 className="card-title mb-1">Stock Colour Summary</h5>
                <p className='mb-0 text-muted f-s-13'>
                  Live counts grouped by stock health colour bands
                </p>
              </div>
              <div className='d-flex align-items-center gap-3 ms-auto'>
                {/* <button
                  type='button'
                  className='btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2'
                  onClick={fetchStockColourCounts}
                  disabled={stockCountsLoading}
                >
                  <span className='text-primary fw-semibold'>
                    {stockCountsLoading ? 'Refreshing...' : 'Refresh'}
                  </span>
                  <i className={`fas fa-rotate-right text-primary ${stockCountsLoading ? 'fa-spin' : ''}`}></i>
                </button> */}
                <button
                  type='button'
                  onClick={() => setIsStockCountsVisible((prev) => !prev)}
                  className='border-0 bg-transparent ms-auto'
                >
                  <i
                    className={`fas ${isStockCountsVisible ? 'fa-chevron-up' : 'fa-chevron-down'} f-s-20`}
                  ></i>
                </button>
              </div>
            </div>
            {isStockCountsVisible && (
              <div className='card-body pt-4'>
                <div className='d-flex flex-wrap gap-3'>
                  {stockCountCards.map((item) => (
                    <div key={item.key} style={{ flex: '1 1 180px', minWidth: '180px' }}>
                      <div
                        className='h-100 position-relative'
                        style={{
                          borderRadius: '18px',
                          padding: '18px 18px 16px',
                          background: '#ffffff',
                          border: `1px solid ${item.glow}`,
                          boxShadow: `0 12px 30px ${item.glow}`,
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            background: item.glow,
                            color: item.accent,
                          }}
                          className='d-flex align-items-center justify-content-center mb-3'
                        >
                          <i className={item.icon}></i>
                        </div>
                        <div className='d-flex align-items-start justify-content-between gap-2'>
                          <div>
                            <div className='fw-semibold' style={{ color: item.textColor }}>
                              {item.title}
                            </div>
                            <div className='text-muted f-s-12 mt-1'>{item.subtitle}</div>
                          </div>
                          <div
                            className='fw-bold'
                            style={{
                              fontSize: '28px',
                              lineHeight: 1,
                              color: item.accent,
                            }}
                          >
                            {stockColourCounts[item.key]}
                          </div>
                        </div>
                        <div
                          className='mt-3'
                          style={{
                            height: '6px',
                            borderRadius: '999px',
                            background: '#eef2f7',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min((stockColourCounts[item.key] || 0) * 8, 100)}%`,
                              height: '100%',
                              background: item.accent,
                              borderRadius: '999px',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3'>
                  <p className='mb-0 text-muted f-s-13'>
                    {stockCountsLastUpdated
                      ? `Last updated: ${stockCountsLastUpdated.toLocaleDateString('en-GB')} ${stockCountsLastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Last updated: --'}
                  </p>
                  <div className='text-muted f-s-12'>
                    Black = Critical, Red = Very Low, Yellow = Low, Green = Good, Cyan = Overstock
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='col-12'>
          <div className='card'>
            <div className='card-header d-flex justify-content-between align-items-center border-0'>
              <div>
                <h5 className="card-title ">Inventory Overview</h5>
               
              </div>
              <button type='button' onClick={handleToggle} className='ms-auto border-0 bg-transparent'>
                <i
                  className={`fas ${isVisible ? "fa-chevron-up" : "fa-chevron-down"
                    } f-s-20 ms-auto`}
                ></i>
              </button>
            </div>
            {isVisible && (
              <div className='card-body pb-0 pt-4 '>
              {/* <div className='d-flex align-items-center gap-2 mt-1 lastUpdate mb-2 flex-wrap'> <p className='mb-0'>Last updated: 3:00 pm, 07 Jan 2025</p>
                  <button type='button' className='text-primary bg-transparent border-0'>Refresh <i class="fas fa-redo ms-2"></i></button>
                </div> */}
                <InventoryOverview onOverviewUpdate={handleOverviewUpdate} />
                <TopItems />
              </div>
            )}

          </div>
        </div>

        {/* <div className='col-12'>
          <StockLevels />
        </div> */}
        <div className='col-12'>
          <InventoryPerformance />
        </div>
        <div className='col-12'>
          <div className='card'>
            <div className='card-header border-0 d-flex align-items-center gap-2'>
              <div>
                <h5 className="card-title ">Stock Valuation</h5>
                <div className='d-flex align-items-center gap-2 mt-1'> <p className='mb-0'>Last updated: {stockValuationLastUpdated ? moment(stockValuationLastUpdated).format('h:mm A, DD MMM YYYY') : '--'}</p>
                  <button type='button' className='text-primary bg-transparent border-0' onClick={() => fetchStockValuation(activeStockValuationType)} disabled={stockValuationLoading}>Refresh <i className={`fas fa-redo ms-2 ${stockValuationLoading ? 'fa-spin' : ''}`}></i></button>
                </div>
              </div>
                {/* <h5 className="card-title"></h5> */}
                <div className='stock_value'>
                  <p className='exp-task-details-item mb-0'>
                    <span className='exp-task-details-name'>Total Items :</span>
                    {inventoryOverview.totalItems}
                  </p>
                  <p className='exp-task-details-item mb-0'>
                    <span className='exp-task-details-name'>Stock Valuation :</span>
                    {formatCurrency(inventoryOverview.totalValuation)} (Based on FIFO Pricing)
                  </p>
                </div>
            </div>
            <div className='card-body'>
              <div className="w-100">
                <ul className="nav nav-tabs gth-tabs gth-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="age-file-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#age-file"
                      type="button"
                      role="tab"
                      aria-controls="age-file"
                      aria-selected="true"
                      onClick={() => setActiveStockValuationType('age')}
                    >
                      Age
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="category-file-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#category-file"
                      type="button"
                      role="tab"
                      aria-controls="category-file"
                      aria-selected="false"
                      onClick={() => setActiveStockValuationType('category')}
                    >
                      Category
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="store-file-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#store-file"
                      type="button"
                      role="tab"
                      aria-controls="store-file"
                      aria-selected="false"
                      onClick={() => setActiveStockValuationType('store')}
                    >
                      Store
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active py-3 pb-0"
                    id="age-file"
                    role="tabpanel"
                    aria-labelledby="age-file-tab"
                  >
                    <div className='absolute_popover'>
                      <OverlayTrigger
                        trigger="click"
                        rootClose
                        placement="left"
                        overlay={
                          <Popover id="my-kpi-help" className="unique-outer-wrap">
                            <div className='unique-outer-wrap'>
                              <div className='exp-popover-wrap'>
                                <h5>How we calculate Stock Valuation? (Age)</h5>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Stock Valuation :</span>
                                  Based on Default pricing
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Default Pricing stock valuation :</span>
                                  Valuation based on the item prices you set for items in inventory
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Age :</span>
                                  Calculated based on current date and the date when the item was brought into Inventory
                                </p>
                              </div>
                            </div>
                          </Popover>
                        }
                      >

                        <span className="cursor-pointer text-primary" >
                          <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="16" height="16" fill='currentColor'><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,20a1,1,0,1,1,1-1A1,1,0,0,1,12,20Zm1.93-7.494A1.982,1.982,0,0,0,13,14.257V15a1,1,0,0,1-2,0v-.743a3.954,3.954,0,0,1,1.964-3.5,2,2,0,0,0,1-2.125,2.024,2.024,0,0,0-1.6-1.595A2,2,0,0,0,10,9,1,1,0,0,1,8,9a4,4,0,1,1,5.93,3.505Z" /></svg>
                        </span>
                      </OverlayTrigger>
                    </div>
                    <div className='row'>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <StockValuation rows={stockValuationRows} loading={stockValuationLoading} />
                      </div>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <div className='card mb-0'>
                          <div className='card-body p-0'>
                            <div className="table-responsive">
                              <Table className="table-bordered primary-table-head">
                                <thead>
                                  <tr>
                                    <th>Item ID *</th>
                                    <th>Item Name</th>
                                    <th>Stock</th>
                                    <th>Stock Value</th>

                                  </tr>
                                </thead>
                                <tbody>
                                  {stockValuationLoading ? (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        Loading stock valuation...
                                      </td>
                                    </tr>
                                  ) : stockValuationRows.length > 0 ? (
                                    stockValuationRows.map((row) => (
                                      <tr key={`age-${row.product_id}-${row.item_id}`}>
                                        <td><div style={{ width: '150px' }}>{row.item_id || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.item_name || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.total_stock ?? 0}</div></td>
                                        <td><div style={{ width: '180px' }}>{formatCurrency(row.total_stock_value)}</div></td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        No stock valuation data available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div
                    className="tab-pane fade py-3 pb-0"
                    id="category-file"
                    role="tabpanel"
                    aria-labelledby="category-file-tab"
                  >
                    <div className='absolute_popover'>
                      <OverlayTrigger
                        trigger="click"
                        rootClose
                        placement="left"
                        overlay={
                          <Popover id="my-kpi-help" className="unique-outer-wrap">
                            <div className='unique-outer-wrap'>
                              <div className='exp-popover-wrap'>
                                <h5>How we calculate Stock Valuation? (Category)</h5>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Stock Valuation :</span>
                                  Based on FIFO pricing
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>FIFO Pricing Stock Valuation :</span>
                                  This method assumes that the oldest items in inventory are sold or used first,
                                  and the most recent items are sold or used last
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Category :</span>
                                  Category is assigned to items by you at the time of creation
                                </p>
                              </div>
                            </div>
                          </Popover>
                        }
                      >

                        <span className="cursor-pointer text-primary" >
                          <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="16" height="16" fill='currentColor'><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,20a1,1,0,1,1,1-1A1,1,0,0,1,12,20Zm1.93-7.494A1.982,1.982,0,0,0,13,14.257V15a1,1,0,0,1-2,0v-.743a3.954,3.954,0,0,1,1.964-3.5,2,2,0,0,0,1-2.125,2.024,2.024,0,0,0-1.6-1.595A2,2,0,0,0,10,9,1,1,0,0,1,8,9a4,4,0,1,1,5.93,3.505Z" /></svg>
                        </span>
                      </OverlayTrigger>
                    </div>

                    <div className='row'>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <StockValuation rows={stockValuationRows} loading={stockValuationLoading} />
                      </div>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <div className='card mb-0'>
                          <div className='card-body p-0'>
                            <div className="table-responsive">
                              <Table className="table-bordered primary-table-head">
                                <thead>
                                  <tr>
                                    <th>Item ID *</th>
                                    <th>Item Name</th>
                                    <th>Stock</th>
                                    <th>Stock Value</th>

                                  </tr>
                                </thead>
                                <tbody>
                                  {stockValuationLoading ? (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        Loading stock valuation...
                                      </td>
                                    </tr>
                                  ) : stockValuationRows.length > 0 ? (
                                    stockValuationRows.map((row) => (
                                      <tr key={`category-${row.product_id}-${row.item_id}`}>
                                        <td><div style={{ width: '150px' }}>{row.item_id || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.item_name || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.total_stock ?? 0}</div></td>
                                        <td><div style={{ width: '180px' }}>{formatCurrency(row.total_stock_value)}</div></td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        No stock valuation data available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="tab-pane fade py-3 pb-0"
                    id="store-file"
                    role="tabpanel"
                    aria-labelledby="store-file-tab"
                  >
                    <div className='absolute_popover'>
                      <OverlayTrigger
                        trigger="click"
                        rootClose
                        placement="left"
                        overlay={
                          <Popover id="my-kpi-help" className="unique-outer-wrap">

                            <div className='unique-outer-wrap'>
                              <div className='exp-popover-wrap'>
                                <h5>How we calculate Stock Valuation? (Store)</h5>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Stock Valuation :</span>
                                  Based on FIFO pricing
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Default Pricing stock valuation :</span>
                                  This method assumes that the oldest items in inventory are sold or used first, and the most recent items are sold or used last
                                </p>
                                <p className='exp-task-details-item'>
                                  <span className='exp-task-details-name'>Age :</span>
                                  is equivalent to a "Warehouse"
                                </p>
                              </div>
                            </div>
                          </Popover>
                        }
                      >

                        <span className="cursor-pointer text-primary" >
                          <svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="16" height="16" fill='currentColor'><path d="M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm0,20a1,1,0,1,1,1-1A1,1,0,0,1,12,20Zm1.93-7.494A1.982,1.982,0,0,0,13,14.257V15a1,1,0,0,1-2,0v-.743a3.954,3.954,0,0,1,1.964-3.5,2,2,0,0,0,1-2.125,2.024,2.024,0,0,0-1.6-1.595A2,2,0,0,0,10,9,1,1,0,0,1,8,9a4,4,0,1,1,5.93,3.505Z" /></svg>
                        </span>
                      </OverlayTrigger>
                    </div>
                    <div className='row'>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <StockValuation rows={stockValuationRows} loading={stockValuationLoading} />
                      </div>
                      <div className='col-lg-6 col-md-6 col-sm-12'>
                        <div className='card mb-0'>
                          <div className='card-body p-0'>
                            <div className="table-responsive">
                              <Table className="table-bordered primary-table-head">
                                <thead>
                                  <tr>
                                    <th>Item ID *</th>
                                    <th>Item Name</th>
                                    <th>Stock</th>
                                    <th>Stock Value</th>

                                  </tr>
                                </thead>
                                <tbody>
                                  {stockValuationLoading ? (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        Loading stock valuation...
                                      </td>
                                    </tr>
                                  ) : stockValuationRows.length > 0 ? (
                                    stockValuationRows.map((row) => (
                                      <tr key={`store-${row.product_id}-${row.item_id}`}>
                                        <td><div style={{ width: '150px' }}>{row.item_id || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.item_name || 'N/A'}</div></td>
                                        <td><div style={{ width: '150px' }}>{row.total_stock ?? 0}</div></td>
                                        <td><div style={{ width: '180px' }}>{formatCurrency(row.total_stock_value)}</div></td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="text-center py-4 text-muted">
                                        No stock valuation data available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;