import React, { useEffect, useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { Button } from "@mui/material";
import { Tooltip } from "antd";
import { PrivateAxios } from "../../../../environment/AxiosInstance";

const DeadStockReport = () => {
    const [reportData, setReportData] = useState([]);
    const [dataState, setDataState] = useState({
        skip: 0,
        take: 10,
        filter: {
            logic: "and",
            filters: []
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await PrivateAxios.get("/product/dead-stock-report");
                const data = Array.isArray(res.data?.data) ? res.data.data : [];
                setReportData(data);
            } catch (err) {
                console.error("API fetch error:", err);
            }
        };
        fetchData();
    }, []);

    const onDataStateChange = (e) => {
        setDataState(e.dataState); // Must update full dataState including filter
    };

    const processedData = process(reportData, dataState);

    return (
        <div className="p-4">
            <div className="mb-3">
                <Button
                    className="btn link-btn text-dark"
                    onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}
                >
                    Back
                </Button>
            </div>

            <div className="card mt-4">
                <div className="card-header bg-primary">
                    <h4 className="card-title mb-0">
                        Dead Stock Report
                        <Tooltip title="Live stock maintenance with current vs minimum levels">
                            <i className="fas fa-info-circle ms-2"></i>
                        </Tooltip>
                    </h4>
                </div>

                <div className="card-body p-0">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="table-responsive mb-0">
                                <Grid
                                    style={{ height: "600px" }}
                                    data={processedData.data}
                                    total={processedData.total}
                                    skip={dataState.skip}
                                    take={dataState.take}
                                    pageable={true}
                                    filterable={true}
                                    filter={dataState.filter}
                                    onDataStateChange={onDataStateChange}
                                >
                                    <GridColumn field="product_code" title="Product Code" />
                                    <GridColumn field="product_name" title="Product Name" />
                                    <GridColumn field="category" title="Category" />
                                    <GridColumn field="unit" title="Unit" />
                                    <GridColumn field="current_stock" title="Current Stock" />
                                    <GridColumn
                                        field="last_dispatch_date"
                                        title="Last Dispatch Date"
                                        cell={(props) => (
                                            <td>
                                                {props.dataItem.last_dispatch_date
                                                    ? new Date(props.dataItem.last_dispatch_date).toLocaleDateString()
                                                    : "Never"}
                                            </td>
                                        )}
                                    />
                                </Grid>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeadStockReport;
