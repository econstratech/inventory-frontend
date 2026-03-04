import React, { useEffect, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { Tooltip } from 'antd';

import { PrivateAxios } from '../../../../environment/AxiosInstance';

function MrpReport() {
    const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        try {
            const response = await PrivateAxios.get("/product/product-stock-maintenance");
            console.log(response.data);
            
            if (response.data.success) {
                // Add ID to each row for indexing
                const withIds = response.data.data.map((item, index) => ({
                    id: index + 1,
                    ...item
                }));
                setReportData(withIds);
            }
        } catch (err) {
            console.error("Failed to fetch report:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}>
                    Back
                </Button>
            </div>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title mb-0'>Stock Maintenance Report
                        <Tooltip title="Live stock maintenance with current vs minimum levels">
                            <i className='fas fa-info-circle ms-2'></i>
                        </Tooltip>
                    </h4>
                </div>
                <div className='card-body p-0'>
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className='table-responsive mb-0'>
                                <Grid
                                    data={process(reportData, { filter })}
                                    filterable
                                    filter={filter}
                                    onFilterChange={(e) => setFilter(e.filter)}
                                    style={{ width: '100%' }}
                                >
                                    <GridColumn field="id" title="#" width="80px" headerClassName="fw-bold" filterable={false} />
                                    <GridColumn
                                        field="product"
                                        title="Product"
                                        width="250px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td>
                                                <div>
                                                    <div><strong>{props.dataItem.product_name}</strong></div>
                                                    <div className="text-muted">Code: {props.dataItem.product_code}</div>
                                                </div>
                                            </td>
                                        )}
                                    />
                                    <GridColumn
                                        field="store_name"
                                        title="Store"
                                        width="180px"
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="current_stock"
                                        title="Current Stock"
                                        width="150px"
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="minimum_stock_level"
                                        title="Minimum Stock Level"
                                        width="180px"
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="need"
                                        title="Need"
                                        width="100px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td className={parseInt(props.dataItem.need) > 0 ? "text-danger fw-bold" : ""}>
                                                {props.dataItem.need}
                                            </td>
                                        )}
                                    />
                                    <GridColumn
                                        field="excess"
                                        title="Excess"
                                        width="100px"
                                        headerClassName="fw-bold"
                                        cell={(props) => (
                                            <td className={parseInt(props.dataItem.excess) > 0 ? "text-success fw-bold" : ""}>
                                                {props.dataItem.excess}
                                            </td>
                                        )}
                                    />
                                </Grid>
                                {loading && <div className="p-3">Loading report...</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MrpReport;
