import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { Button } from "@mui/material";
import { PrivateAxios } from "../../../../environment/AxiosInstance";

function AgingReport() {
  const [reportData, setReportData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });

  const [filter, setFilter] = useState(null);
  const handleGenerateReport = async (e) => {
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

    try {
      const params =
        selectedRange === "custom"
          ? {
            startDate: fmsData.startDate.toISOString(),
            endDate: fmsData.endDate.toISOString(),
          }
          : {};

      const res = await PrivateAxios.get("/product/stock-aging-report", {
        params,
      });
      setReportData(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch report", error);
      alert("Error fetching report");
    }
  };
  const [pageState, setPageState] = useState({
    skip: 0,
    take: 10,
  });
  const handleReset = () => {
    setSelectedRange("3m");
    setFmsData({ startDate: null, endDate: null });
    setFilter({ logic: "and", filters: [] });
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <Button
          className="btn link-btn text-dark"
          onClick={() => window.history.back()}
        >
          <i className="fas fa-long-arrow-alt-left me-1" /> Back
        </Button>
      </div>

      <form onSubmit={handleGenerateReport}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Aging Report</h4>
          </div>
          <div className="card-body pb-1">
            <div className="row">
              <div className="col-xl-6">
                <div className="form-group">
                  <label className="col-form-label">
                    Quick Report <span className="text-exp-red">*</span>
                  </label>
                  <div className="d-flex flex-wrap">
                    {["3m", "6m", "custom"].map((range) => (
                      <label
                        key={range}
                        className="custom-radio btn-type-radio mb-2 me-3"
                      >
                        <input
                          type="radio"
                          name="reportRange"
                          value={range}
                          checked={selectedRange === range}
                          onChange={() => setSelectedRange(range)}
                        />
                        <span className="checkmark" />
                        <span className="text-">
                          {range === "3m"
                            ? "3 Months"
                            : range === "6m"
                              ? "6 Months"
                              : "Custom Range"}
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedRange === "custom" && (
                    <div className="row">
                      <div className="col-md-6 col-12">
                        <label className="col-form-label">
                          From <span className="text-exp-red">*</span>
                        </label>
                        <div className="exp-datepicker-cont">
                          <span className="cal-icon">
                            <i className="fas fa-calendar-alt" />
                          </span>
                          <DatePicker
                            required
                            selected={fmsData.startDate}
                            onChange={(date) =>
                              setFmsData({ ...fmsData, startDate: date })
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select Date"
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="col-form-label">
                          To <span className="text-exp-red">*</span>
                        </label>
                        <div className="exp-datepicker-cont">
                          <span className="cal-icon">
                            <i className="fas fa-calendar-alt" />
                          </span>
                          <DatePicker
                            required
                            selected={fmsData.endDate}
                            onChange={(date) =>
                              setFmsData({ ...fmsData, endDate: date })
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select Date"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-exp-light me-2"
              onClick={handleReset}
            >
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
          <div style={{ minWidth: "800px", overflowX: "auto" }}>
            <Grid
              data={process(reportData, { ...pageState, filter })}
              filterable={true}
              filter={filter}
              onFilterChange={(e) => setFilter(e.filter)}
              pageable={{ pageSizes: [5, 10, 20], buttonCount: 5 }}
              skip={pageState.skip}
              take={pageState.take}
              total={reportData.length}
              onPageChange={(e) => setPageState({ skip: e.page.skip, take: e.page.take })}
              sortable={true}
              style={{ width: "100%" }}
            >
              <GridColumn
                title="#"
                width="80px"
                filterable={true}
                cell={(props) => <td>{props.dataIndex + 1}</td>}
              />

              <GridColumn
                field="product_name"
                title="Item"
                filterable={true}
                cell={(props) => (
                  <td>
                    <div>Name: {props.dataItem.product_name || "-"}</div>
                    <div>Code: {props.dataItem.product_code || "-"}</div>
                  </td>
                )}
              />

              <GridColumn
                field="last_movement_date"
                title="Last Movement Date"
                width="200px"
                filterable={true}
                cell={(props) => {
                  const date = new Date(props.dataItem.last_movement_date);
                  return <td>{date.toLocaleDateString()}</td>;
                }}
                headerStyle={{ minWidth: "200px" }}
                cellStyle={{ minWidth: "200px" }}
              />
              <GridColumn
                field="store_name"
                title="Store"
                filterable={true}
                cell={(props) => (
                  <td>
                    <div>{props.dataItem.store_name || "-"}</div>
                  </td>
                )}
                width="150px"
                headerStyle={{ minWidth: "250px" }}
                cellStyle={{ minWidth: "250px" }}
              />
              <GridColumn
                field="movement_day_count"
                title="Aging Days"
                width="150px"
                cell={(props) => (
                  <td>
                    <div>{props.dataItem.movement_day_count || "0"}</div>
                  </td>
                )}
                headerStyle={{ minWidth: "150px" }}
                cellStyle={{ minWidth: "150px" }}
              />
              <GridColumn field="current_stock" title="Current Stock"
                filterable={true}
                cell={(props) => {
                  return (
                    <td>
                      <div>{props.dataItem.current_stock || "-"}</div>
                    </td>
                  );
                }}
                headerStyle={{ minWidth: "150px" }}
                cellStyle={{ minWidth: "150px" }}
              />
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgingReport;
