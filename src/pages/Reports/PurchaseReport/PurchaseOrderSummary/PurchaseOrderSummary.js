import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function PurchaseOrderSummary() {
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({
    startDate: null,
    endDate: null,
  });

  const [filter, setFilter] = useState({
    logic: "and",
    filters: [],
  });

  const [data, setData] = useState([]);  // grouped purchase orders
  const [loading, setLoading] = useState(false);

  // Group flat API data by purchase_id and combine products
  const groupPurchases = (flatData) => {
    const grouped = {};

    flatData.forEach(row => {
      const pid = row.purchase_id;
      if (!grouped[pid]) {
        grouped[pid] = {
          purchase_id: pid,
          reference_number: row.reference_number,
          order_dateline: row.order_dateline,
          expected_arrival: row.expected_arrival,
          total_amount: row.total_amount,
          untaxed_amount: row.untaxed_amount,
          buyer: row.buyer,
          source_document: row.source_document,
          payment_terms: row.payment_terms,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          vendor_id: row.vendor_id,
          vendor_name: row.vendor_name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          products: [],  // products list
        };
      }

      grouped[pid].products.push({
        purchase_product_id: row.purchase_product_id,
        product_id: row.product_id,
        qty: row.qty,
        unit_price: row.unit_price,
        tax: row.tax,
        taxIncl: row.taxIncl,
        taxExcl: row.taxExcl,
        tax_amount: row.tax_amount,
        product_name: row.product_name,
        product_code: row.product_code,
        unit: row.unit,
        product_price: row.product_price,
      });
    });

    return Object.values(grouped);
  };

  // Fetch data function
  const fetchPurchaseOrderSummary = async () => {
    setLoading(true);
    try {
      const res = await PrivateAxios.get('/purchase/getPurchaseOrderSummary');
      if (res.data.success) {
        const groupedData = groupPurchases(res.data.data);
        setData(groupedData);
      } else {
        alert("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching purchase order summary:", error);
      alert("Error fetching purchase order summary");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data initially
  useEffect(() => {
    fetchPurchaseOrderSummary();
  }, []);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (selectedRange === "custom") {
      if (!fmsData.startDate || !fmsData.endDate) {
        alert("Please select both start and end dates.");
        return;
      }
      if (fmsData.startDate > fmsData.endDate) {
        alert("Start date cannot be after end date.");
        return;
      }
    }
    // For now just refetch data; extend backend to support date filtering if needed
    fetchPurchaseOrderSummary();
  };

  const handleReset = () => {
    setSelectedRange("3m");
    setFmsData({
      startDate: null,
      endDate: null,
    });
    setFilter({
      logic: "and",
      filters: [],
    });
    fetchPurchaseOrderSummary();
  };
const statusLabels = {
  0: "Inactive",
  1: "Active",
  2: "RFQ",
  3: "Sent to Management",
  4: "Review Done",
  5: "Order Confirmed",
  6: "Bill Created & Confirmed",
  7: "Payment Confirmed & Done",
  8: "Rejected by Admin",
  9: "Admin Second Review",
  10: "Product Received Done"
};
  return (
    <div className="p-4">
      <div className="mb-3">
        <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" />
          Back
        </Button>
      </div>

      <form onSubmit={handleGenerateReport}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Purchase Order Summary</h4>
          </div>
          <div className="card-body pb-1">
            <div className="row">
              <div className="col-xl-6">
                <label className="col-form-label">Quick Report <span className="text-exp-red">*</span></label>
                <div className="d-flex flex-wrap">
                  {["3m", "6m", "custom"].map((range) => (
                    <label key={range} className="custom-radio btn-type-radio mb-2 me-3">
                      <input
                        type="radio"
                        name="reportRange"
                        value={range}
                        checked={selectedRange === range}
                        onChange={() => setSelectedRange(range)}
                      />
                      <span className="checkmark" />
                     <span className='text-'>{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>

                    </label>
                  ))}
                </div>

                {selectedRange === "custom" && (
                  <div className="row">
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label className="col-form-label">From <span className="text-exp-red">*</span></label>
                        <div className="exp-datepicker-cont">
                          <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                          <DatePicker
                            required
                            selected={fmsData.startDate}
                            onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select Date"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label className="col-form-label">To <span className="text-exp-red">*</span></label>
                        <div className="exp-datepicker-cont">
                          <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                          <DatePicker
                            required
                            selected={fmsData.endDate}
                            onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select Date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end">
            <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn btn-exp-green">
              Generate Report
            </button>
          </div>
        </div>
      </form>

      <div className="card mt-4">
        <div className="card-header bg-primary">
          <h4 className="card-title">Report Preview</h4>
        </div>
        <div className="card-body p-0 rounded-10 table-responsive mb-0">

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : (
            <Grid
              data={process(data, { filter })}
              filterable={true}
              filter={filter}
              onFilterChange={(e) => setFilter(e.filter)}
              pageable={true}
              sortable={true}
            >
              <GridColumn
                field="purchase_id"
                title="#"
                filterable={false}
                width="80px"
                headerStyle={{ minWidth: '80px' }}
                cellStyle={{ minWidth: '80px' }}
                headerClassName="fw-bold"
              />
              <GridColumn
                field="reference_number"
                title="PO Number"
                width="150px"
                headerStyle={{ minWidth: '150px' }}
                cellStyle={{ minWidth: '150px' }}
                headerClassName="fw-bold"
              />
              <GridColumn
                field="expected_arrival"
                title="Expected Delivery"
                width="200px"
                headerStyle={{ minWidth: '200px' }}
                cellStyle={{ minWidth: '200px' }}
                headerClassName="fw-bold"
                // format date nicely (optional)
                cell={(props) => <td>{new Date(props.dataItem.expected_arrival).toLocaleDateString()}</td>}
              />
              <GridColumn
                field="vendor_name"
                title="Vendor"
                width="200px"
                headerStyle={{ minWidth: '200px' }}
                cellStyle={{ minWidth: '200px' }}
                headerClassName="fw-bold"
              />
              <GridColumn
                field="products"
                title="Item / Qty"
                width="300px"
                headerStyle={{ minWidth: '300px' }}
                cell={(props) => (
                  <td style={{ minWidth: '300px' }}>
                    {props.dataItem.products.map((p, i) => (
                      <div key={i}>
                        <strong>{p.product_name}</strong> - Qty: {p.qty}
                      </div>
                    ))}
                  </td>
                )}
              />
              <GridColumn
  field="status"
  title="Status"
  width="150px"
  headerStyle={{ minWidth: '150px' }}
  cellStyle={{ minWidth: '150px' }}
  headerClassName="fw-bold"
  cell={(props) => <td>{statusLabels[props.dataItem.status] || "Unknown"}</td>}
/>
            </Grid>
          )}

        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderSummary;
