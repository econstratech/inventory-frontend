import React, { useState } from 'react'
import { OverlayTrigger, Table, } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { PDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { Tooltip } from 'antd';


const SalesData = () => {

  const [data, setData] = useState([]);




  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();


  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (data && data.length > 0) {
      excelExportRef.current.save();
    } else {
      alert("No data available for export.");
    }
  };

  const [tableProductData, setTableProductData] = useState([
    {
      itemId: "E0589",
      Description: "Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      location: "EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091",
      quantity: "4",
      uom: "Kg",
      amount: "₹1600",
      invoiceNumber: "INV00001",
      billedTo: "Pratima Majumder",
      billingAddress: "EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091",
      billingNumber: "8236954884",
      deliveryAddress: "EN Block, New Town, Bidhannagar, Kolkata, West Bengal 700091",
      paymentDateTime: "06-03-2025 | 06:30 PM",
      transitionId: "TD258640000580000654",

    },
    {
      itemId: "E05800",
      Description: "Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      location: "EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091",
      quantity: "8",
      uom: "Kg",
      amount: "₹1000",
      invoiceNumber: "INV00051",
      billedTo: "Pratima Majumder",
      billingAddress: "EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700091",
      billingNumber: "8236954884",
      deliveryAddress: "EN Block,  New Town, Bidhannagar, Kolkata, West Bengal 700091",
      paymentDateTime: "06-03-2025 | 06:30 PM",
      transitionId: "TD258640000580000654",

    },


  ]);

  const ActionCell = (props) => {
    const { dataItem } = props || {}; // Ensure props and dataItem exist
    if (!dataItem) return null;

    return (
      <td>
        <label class="badge badge-outline-warning2"><i class="fas fa-spinner f-s-8 d-flex me-1"></i>Inprogress</label>
        <label class="badge badge-outline-meantGreen mt-1"><i class="fas fa-check-circle f-s-8 d-flex me-1"></i>Delivered</label>
        <label class="badge badge-outline-purple mt-1"><i class="fas  fa-ban f-s-8 d-flex me-1"></i>Cancel</label>
      </td>
    );
  }



  return (
    <>
      <div className='p-4'>

        <div className='card mb-0'>
          <div className='card-body pb-0'>
            <div class="ibox-title">
              <h5 className='mb-2'>Sales Data</h5>
            </div>
   
            {/* <div className="d-flex justify-content-between flex-wrap align-items-center pt-2 px-3">
              <div className="table-button-group mb-2 ms-auto">

                <GridToolbar className="border-0 gap-0">
                  <Tooltip title="Export to PDF">
                    <button className=" table-export-btn" onClick={handleExportPDF}>
                      <i class="far fa-file-pdf d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title=" Export to Excel">
                    <button className=" table-export-btn" onClick={handleExportExcel}>
                      <i class="far fa-file-excel d-flex f-s-20"></i>
                    </button>
                  </Tooltip>
                </GridToolbar>
              </div>
            </div> */}
            <div className=''>
              <div className="bg_succes_table_head rounded_table">
                <PDFExport data={data} ref={pdfExportRef}>
                  <ExcelExport data={data} ref={excelExportRef} >
                    <Grid
                      data={tableProductData}
                      sortable
                      filterable={false}
                      pageable={{ buttonCount: 3, pageSizes: true }}

                    >
                      <GridColumn
                        field="itemId"
                        width="100px"
                        title="Item Id"
                        filterable={false}
                        locked={false}
                        className='fw-bold'
                      />
                      <GridColumn
                        field="itemName"
                        title="	Item Name"
                        filter="text"
                        width="300px"
                        filterable={false}
                        locked={false} // Locked column
                        cell={() => (
                          <td>
                            <div className="profile-wrap ">
                              <div className="exp-avtar border pos_avatar ">
                                <img className="prof-img" src={process.env.PUBLIC_URL + '/assets/images/demo-logo.png'} alt="logo" />
                              </div>
                              <div className="ps-2 profile-name-wrap">
                                <h5 className="profile-name text-nowrap">Econstra Business Consultants LLP</h5>
                              </div>
                            </div>
                          </td>
                        )}
                      />

                      <GridColumn field="Description" title="Item Description" filterable={false} filter="text" width="300px" />
                      <GridColumn
                        field="location"
                        title="Location"
                        filter="text"
                        width="300px"
                        filterable={false}
                        locked={false} // Locked column
                      />
                      <GridColumn
                        field="quantity"
                        title="Quantity"
                        width="150px"
                        filterable={false}
                        // className='text-end'
                      // filterCell={CustomDropDownFilter}
                      // cell={CustomCell} 
                      />
                      <GridColumn
                        field="uom"
                        title="UOM"
                        filter="text"
                        width="200px"
                        filterable={false}
                        locked={false} // Locked column

                      />

                      <GridColumn
                        field="amount"
                        title="Amount"
                        filter="text"
                        width="200px"
                        filterable={false}
                        locked={false} // Locked column

                      />
                      <GridColumn field="invoiceNumber" title="Invoice Number" filter="text" width="200px" filterable={false} />
                      <GridColumn field="billedTo" title="Billed to" filter="text" width="200px" filterable={false} />
                      <GridColumn field="billingAddress" title="Billing Address" filter="text" width="300px" filterable={false} />
                      <GridColumn field="billingNumber" title="	Billing Contact Number" filter="text" width="200px" filterable={false} />
                      <GridColumn field="deliveryAddress" title="	Delivery Address" filter="text" width="300px" filterable={false} />
                      <GridColumn
                        field="paymentMethod"
                        title="Payment Method"
                        filter="text"
                        width="300px"
                        filterable={false}
                        locked={false} // Locked column
                        cell={() => (
                          <td>
                            <div>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='fw-bold'>Debit Card</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>Bank Name</span>: <span>Aixs Bank</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>Card Number</span>: <span>1234 5678 9123</span></p>
                            </div>
                            <div>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='fw-bold'>Net Banking</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>Bank Name</span>: <span>State Bank of india</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>Name of Account</span>: <span>Pratima Majumder</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>Account Number</span>: <span>1563 2598 4523</span></p>
                            </div>
                            <div>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='fw-bold'>UPI</span></p>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='text-primary-grey-5'>UPI Id</span>: <span>skb@853gp (Paytm)</span></p>
                            </div>
                            <div>
                              <p className='fw-semibold f-s-14 d-flex align-items-center gap-2 mb-1'><span className='fw-bold'>cash on Delivery</span></p>

                            </div>
                          </td>
                        )}
                      />
                      <GridColumn field="paymentDateTime" title="	Payment Date & Time" filter="text" width="200px" filterable={false} />
                      <GridColumn field="transitionId" title="Transition Id" filter="text" width="200px" filterable={false} />
                      <GridColumn field="action"
                        title="Delivery Status"
                        filter="text"
                        width="200px"
                        filterable={false}
                        cell={ActionCell} />
                    </Grid>
                  </ExcelExport>
                </PDFExport>

              </div>
            </div>
          </div>
        </div>
      </div>



    </>
  )
}

export default SalesData