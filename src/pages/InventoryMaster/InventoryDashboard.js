import React, { useState } from 'react';

import InventoryOverview from './components/InventoryOverview';
import TopItems from './components/TopItems';
import StockLevels from './components/StockLevels';
import InventoryPerformance from './components/InventoryPerformance';
import StockValuation from './components/StockValuation';
import { OverlayTrigger, Popover, Table } from 'react-bootstrap';

const Dashboard = () => {
  //   const [totalCountreject, setTotalCount] = useState(0);
  //   const [totalCountdone, setTotaldoneCount] = useState(0);
  //   const [totalUserscount, setTotalUsers] = useState(0);
  //   const [totalUserscountrfq, setTotalrfq] = useState(0);
  //   const [error, setError] = useState(null);
  //   const fetchData = async () => {
  //     try {
  //       const response = await PrivateAxios.get('purchase/reject_count'); // Adjust URL to your API endpoint
  //       setTotalCount(response.data.totalCount);

  //     } catch (error) {
  //       setError(error.message);
  //     } 
  //   };
  //   const fetchDatadone = async () => {
  //     try {
  //       const response = await PrivateAxios.get('purchase/done_count'); // Adjust URL to your API endpoint

  //       setTotaldoneCount(response.data.totalCountdone);

  //     } catch (error) {
  //       setError(error.message);
  //     } 
  //   };
  //   //total user count
  //   const totalUsers = async () => {
  //     try {
  //       const response = await PrivateAxios.get('user/allusercount'); // Adjust URL to your API endpoint

  //       setTotalUsers(response.data.totalCountuser);

  //     } catch (error) {
  //       setError(error.message);
  //     } 
  //   };

  //   //total rfq count
  //   const totalrfq = async () => {
  //     try {
  //       const response = await PrivateAxios.get('purchase/rfq_count'); // Adjust URL to your API endpoint

  //       setTotalrfq(response.data.totalCountrfq);

  //     } catch (error) {
  //       setError(error.message);
  //     } 
  //   };

  //   useEffect(() => {
  //     totalrfq();
  //     totalUsers();
  //     fetchDatadone();
  //     fetchData();
  //   }, []); 

  const [isVisible, setIsVisible] = useState(true);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };


  return (
    <div className="p-4">
      <div className='row'>
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
                <InventoryOverview />
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
              <div className=''>
              <div>
                <h5 className="card-title ">Stock Valuation</h5>
                <div className='d-flex align-items-center gap-2 mt-1'> <p className='mb-0'>Last updated: 3:00 pm, 07 Jan 2025</p>
                  <button type='button' className='text-primary bg-transparent border-0'>Refresh <i class="fas fa-redo ms-2"></i></button>
                </div>
              </div>
                {/* <h5 className="card-title"></h5> */}
                <div className='stock_value'>
                  <p className='exp-task-details-item mb-0'>
                    <span className='exp-task-details-name'>Total Items :</span>
                    13
                  </p>
                  <p className='exp-task-details-item mb-0'>
                    <span className='exp-task-details-name'>Stock Valuation :</span>
                    ₹1.48 Cr (Based on FIFO Pricing)
                  </p>
                </div>
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
                        <StockValuation />
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
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00010</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 11</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00015</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 51</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00018</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 41</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00020</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 31</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
                                  <tr>
                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>
                                  </tr>
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
                        <StockValuation />
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
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00010</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 11</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00015</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 51</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00018</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 41</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00020</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 31</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
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
                        <StockValuation />
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
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00010</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 11</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00015</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 51</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00018</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 41</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00020</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 31</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
                                  <tr>

                                    <td><div style={{ width: '150px' }}>SKU00025</div></td>
                                    <td><div style={{ width: '150px' }}>Raw Material 21</div></td>
                                    <td><div style={{ width: '150px' }}>100000</div></td>
                                    <td><div style={{ width: '180px' }}>₹1.25 Cr</div></td>

                                  </tr>
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