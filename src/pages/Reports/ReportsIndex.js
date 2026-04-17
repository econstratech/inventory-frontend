import React from 'react'
import { Link } from 'react-router-dom'
import { UserAuth } from '../auth/Auth';

function ReportsIndex() {
      const { MatchPermission } = UserAuth();
    
    return (
        <>
            <div className='p-4'>
                <div className='card'>
                    <div className='card-body'>
                        <div className='mb-4'>
                            <div className="report-img-wrap text-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    version="1.1"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    width={120}
                                    height={120}
                                    x={0}
                                    y={0}
                                    viewBox="0 0 512 512"
                                    xmlSpace="preserve"
                                    className=""
                                >
                                    <g>
                                        <g data-name="Analytic-graph copy 2">
                                            <path
                                                fill="#00a5ab"
                                                d="M488 432v56H312v-40l32-32 40 40 24-24 24 24 40-40z"
                                                opacity={1}
                                                data-original="#00a5ab"
                                            />
                                            <path
                                                fill="#ff5a21"
                                                d="M488 312v120l-16-16-40 40-24-24-24 24-40-40-32 32v-40l48-48 40 40z"
                                                opacity={1}
                                                data-original="#ff5a21"
                                                className=""
                                            />
                                            <path
                                                fill="#007d93"
                                                d="M352 424v64h-40v-40l32-32z"
                                                opacity={1}
                                                data-original="#007d93"
                                            />
                                            <path
                                                fill="#fc3c1d"
                                                d="m380 380-28 28v16l-8-8-32 32v-40l48-48zM488 312v40l-48 48-20-20z"
                                                opacity={1}
                                                data-original="#fc3c1d"
                                                className=""
                                            />
                                            <path
                                                fill="#00a5ab"
                                                d="M120 328h32v128h-32z"
                                                opacity={1}
                                                data-original="#00a5ab"
                                            />
                                            <path
                                                fill="#ffd648"
                                                d="M56 376h32v80H56z"
                                                opacity={1}
                                                data-original="#ffd648"
                                            />
                                            <path
                                                fill="#ff5a21"
                                                d="M184 296h32v160h-32z"
                                                opacity={1}
                                                data-original="#ff5a21"
                                                className=""
                                            />
                                            <path
                                                fill="#007d93"
                                                d="M120 328h16v128h-16z"
                                                opacity={1}
                                                data-original="#007d93"
                                            />
                                            <path
                                                fill="#ffb300"
                                                d="M56 376h16v80H56z"
                                                opacity={1}
                                                data-original="#ffb300"
                                            />
                                            <path
                                                fill="#fc3c1d"
                                                d="M184 296h16v160h-16z"
                                                opacity={1}
                                                data-original="#fc3c1d"
                                                className=""
                                            />
                                            <path
                                                fill="#ff5a21"
                                                d="M255.66 72.34A102.981 102.981 0 0 1 272 128H168V24a104.324 104.324 0 0 1 87.66 48.34z"
                                                opacity={1}
                                                data-original="#ff5a21"
                                                className=""
                                            />
                                            <path
                                                fill="#ffd648"
                                                d="M205.28 237.28A103.832 103.832 0 0 1 128 272c-57.05 0-104-46.95-104-104S70.95 64 128 64v104h104a103.491 103.491 0 0 1-26.72 69.28z"
                                                opacity={1}
                                                data-original="#ffd648"
                                            />
                                            <path
                                                fill="#fc3c1d"
                                                d="M208 32.1V128h-40V24a102.445 102.445 0 0 1 40 8.1z"
                                                opacity={1}
                                                data-original="#fc3c1d"
                                                className=""
                                            />
                                            <path
                                                fill="#ffb300"
                                                d="M148.02 270.04A102.58 102.58 0 0 1 128 272c-57.05 0-104-46.95-104-104S70.95 64 128 64v8.1C90.56 87.9 64 125.09 64 168c0 50.22 36.39 92.62 84.02 102.04z"
                                                opacity={1}
                                                data-original="#ffb300"
                                            />
                                            <path
                                                fill="#00a5ab"
                                                d="m237.657 101.657-11.314-11.314 40-40A8 8 0 0 1 272 48h64v16h-60.687zM336 256H216a8 8 0 0 1-5.657-2.343l-40-40 11.314-11.314L219.313 240H336zM256 496H24a8 8 0 0 1-8-8V288h16v192h224z"
                                                opacity={1}
                                                data-original="#00a5ab"
                                            />
                                            <path
                                                fill="#ff5a21"
                                                d="M352 48h64v16h-64zM352 80h64v16h-64zM352 112h64v16h-64zM432 80h64v16h-64zM432 112h64v16h-64z"
                                                opacity={1}
                                                data-original="#ff5a21"
                                                className=""
                                            />
                                            <g fill="#ffd648">
                                                <path
                                                    d="M352 240h64v16h-64zM432 240h64v16h-64zM352 208h64v16h-64zM432 208h64v16h-64zM352 176h64v16h-64zM432 176h64v16h-64z"
                                                    fill="#ffd648"
                                                    opacity={1}
                                                    data-original="#ffd648"
                                                />
                                            </g>
                                            <path
                                                fill="#00a5ab"
                                                d="M496 496H280a8 8 0 0 1-8-8V288h16v192h208z"
                                                opacity={1}
                                                data-original="#00a5ab"
                                            />
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <h5 className='text-center'>Please select a format to view the report.</h5>
                        </div>
                        <div className='row g-4'>
                            {MatchPermission(["Inventory Master Reports"]) ?
                            <div className='col-lg-6'>
                                <div className='card h-100 mb-0'>
                                    <div className='card-body'>
                                        <h6 className='text-start fw-bold'>INVENTORY MASTER REPORTS</h6>
                                        <ul className='mb-0 f-s-15 fw-medium'>
                                            {/* <li><Link to="/report/stock-ledger-report">Stock Ledger Report</Link></li> */}
                                            {/* <li><Link to="/report/fifo-lifo-stock-valuation-report">FIFO/LIFO Stock Valuation</Link></li> */}
                                            <li><Link to="/report/stock-transfer-report">Stock Transfer Report</Link></li>
                                            <li><Link to="/report/batch-expiry-report">Batch Expiry Report</Link></li>
                                            {/* <li><Link to="/report/inventory-valuation-summary">Inventory Valuation Summary</Link></li> */}
                                            {/* <li><Link to="/report/reorder-level-report">Reorder Level Report</Link></li> */}
                                            {/* <li><Link to="/report/aging-report">Aging Report</Link></li> */}
                                            {/* <li><Link to="/report/bin-card-item-movement-report">Bin Card / Item Movement Report</Link></li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            : null}
                             {MatchPermission(["PO Reports"]) ?
                            <div className='col-lg-6'>
                                <div className='card h-100 mb-0'>
                                    <div className='card-body'>
                                        <h6 className='text-start fw-bold'>PURCHASE REPORTS</h6>
                                        <ul className='mb-0 f-s-15 fw-medium'>
                                            {/* <li><Link to="/report/purchase-order-summary">Purchase Order Summary</Link></li> */}
                                            {/* <li><Link to="/report/purchase-register">Purchase Register</Link></li> */}
                                            <li><Link to="/report/pending-po-report">Pending PO Report</Link></li>
                                            {/* <li><Link to="/report/vendor-performance-report">Vendor Performance Report</Link></li> */}
                                            {/* <li><Link to="/report/purchase-rate-comparison">Purchase Rate Comparison</Link></li> */}
                                            {/* <li><Link to="/report/pr-to-po-conversion-report">PR to PO Conversion Report</Link></li> */}
                                            <li><Link to="/report/month-wise-purchase-value">Month Wise Purchase Value Report</Link></li>
                                            <li><Link to="/report/item-wise-purchase-report">Item-wise Purchase Report</Link></li>
                                            <li><Link to="/report/indent-requirement-report">Indent Requirement Report</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            : null}
                            {MatchPermission(["Sales Reports"]) ?
                            <div className='col-lg-6'>
                                <div className='card h-100 mb-0'>
                                    <div className='card-body'>
                                        <h6 className='text-start fw-bold'>SALES REPORTS</h6>
                                        <ul className='mb-0 f-s-15 fw-medium'>
                                            {/* <li><Link to="/report/sale-register">Sales Register</Link></li> */}
                                            <li><Link to="/report/customer-wise-sales-report">Customer Wise Sales Report</Link></li>
                                            <li><Link to="/report/item-wise-sales-report">Item Wise Sales Report</Link></li>
                                            {/* <li><Link to="/report/profitability-report">Profitability Report</Link></li> */}
                                            {/* <li><Link to="/report/top-selling-products-report">Top Selling Product Report</Link></li> */}
                                            {/* <li><Link to="/report/region-wise-sales-report">Region Wise Sale Report</Link></li> */}
                                            {/* <li><Link to="/report/backorder-report">Back Order Report</Link></li> */}
                                            {/* <li><Link to="/report/slow-moving-item-report">Slow Moving Item Report</Link></li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            : null}
                            {MatchPermission(["Combined Reports"]) ?
                            <div className='col-lg-6' style={{ display: 'none' }}>
                                <div className='card h-100 mb-0'>
                                    <div className='card-body'>
                                        <h6 className='text-start fw-bold'>CROSS-MODULE / COMBINED REPORTS</h6>
                                        <ul className='mb-0 f-s-15 fw-medium'>
                                            <li><Link to="/report/stock-sale-analysis">Stock vs Sales Analysis</Link></li>
                                            {/* <li><Link to="/report/purchase-consumption-report">Purchase vs Consumption Report</Link></li> */}
                                            {/* <li><Link to="/report/abc-analysis-report">ABC Analysis</Link></li> */}
                                            <li><Link to="/report/dead-stock-report">Dead Stock Report</Link></li>
                                            {/* <li><Link to="/report/mrp-report">MRP (Material Requirements Planning)</Link></li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            : ""}
                            <div className='col-lg-6'>
                                <div className='card h-100 mb-0'>
                                    <div className='card-body'>
                                        <h6 className='text-start fw-bold'>PRODUCTION REPORTS</h6>
                                        <ul className='mb-0 f-s-15 fw-medium'>
                                            <li><Link to="/report/production/material-issue-report">Material Issue Report</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReportsIndex