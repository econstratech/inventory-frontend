import React, { useEffect, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';

import moment from 'moment';
import { PrivateAxios } from '../../../environment/AxiosInstance';

function CustomerNotTurnUp() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dataState, setDataState] = useState({
        skip: 0,
        take: 6,
    });

    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        PrivateAxios.get("/pos/getAllOrdersWithItems")
            .then((res) => {
                const orders = res.data;
                const grouped = {};

                orders.forEach(order => {
                    const custId = order.customer_id;
                    const existing = grouped[custId];

                    if (!existing || new Date(order.created_at) > new Date(existing.lastPurchaseDate)) {
                        grouped[custId] = {
                            customerName: order.customer_name,
                            lastPurchaseDate: order.created_at,
                            phone: order.customer_phone,
                            email: order.customer_email || "", // fallback if missing
                        };
                    }
                });

                const finalData = Object.values(grouped).map(item => ({
                    ...item,
                    lastPurchaseDate: moment(item.lastPurchaseDate).format("DD/MM/YYYY"),
                }));

                setTableData(finalData);
            })
            .catch((err) => {
                console.error("Error fetching customer data:", err);
            });
    }, []);

    const handleDataStateChange = (e) => {
        setDataState(e.dataState);
    };

    return (
        <div className='card'>
            <div className='card-header d-flex justify-content-between align-items-center flex-wrap '>
                <div>
                    <h5 className='card-title'>Customer Not Turn Up</h5>
                    <p className='mb-0'>(Last 6 months data)</p>
                </div>
            </div>
            <div className='card-body p-0'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='table-responsive mb-0'>
                            <Grid
                                data={process(tableData, dataState)}
                                {...dataState}
                                onDataStateChange={handleDataStateChange}
                                pageable={{ pageSizes: [5, 10, 20], buttonCount: 6 }}
                                sortable={true}
                                filterable={true}
                                style={{ width: '100%' }}
                            >
                                <GridColumn field="customerName" title="Customer Name" width="200px" headerClassName="fw-bold" />
                                <GridColumn
                                    field="lastPurchaseDate"
                                    title="Last Purchase Date"
                                    width="180px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td><div>{props.dataItem.lastPurchaseDate}</div></td>
                                    )}
                                />
                                <GridColumn
                                    field="phone"
                                    title="Phone"
                                    width="150px"
                                    headerClassName="fw-bold"
                                    cell={(props) => (
                                        <td><div>{props.dataItem.phone}</div></td>
                                    )}
                                />
                               
                            </Grid>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerNotTurnUp;
