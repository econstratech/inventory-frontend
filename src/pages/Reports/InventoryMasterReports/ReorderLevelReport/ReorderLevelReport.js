import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function ReorderLevelReport() {
 const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch and filter data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await PrivateAxios.get('/product/list'); 
                const products = res.data?.data || [];

                // Filter where current_stock < minimum_stock_level
                const lowStockProducts = products.filter(p =>
                    p.current_stock !== null &&
                    p.minimum_stock_level !== null &&
                    Number(p.current_stock) < Number(p.minimum_stock_level)
                );

                // Format for grid display
                const formatted = lowStockProducts.map((item, index) => ({
                    id: index + 1,
                    name: item.product_name,
                    code: item.product_code,
                    currentStock: item.current_stock,
                    minimumStock: item.minimum_stock_level
                }));

                setData(formatted);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark"
                    onClick={() => window.history.back()}
                >
                    <i className="fas fa-long-arrow-alt-left me-1" />
                    Back
                </Button>
            </div>
          

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title'>Lowstock Preview</h4>
                </div>
                <div className='card-body p-0 rounded-10 table-responsive mb-0'>
                    <div style={{ minWidth: '800px', overflowX: 'auto' }}>
                        {loading ? (
                            <p className="p-4">Loading...</p>
                        ) : (
                            <Grid
                                data={process(data, { filter })}
                                filterable={true}
                                filter={filter}
                                onFilterChange={(e) => setFilter(e.filter)}
                                style={{ width: '100%', minWidth: '800px' }}
                            >
                                <GridColumn
                                    field="id"
                                    title="#"
                                    width="80px"
                                    filterable={false}
                                    headerStyle={{ minWidth: '80px' }}
                                    cellStyle={{ minWidth: '80px' }}
                                />
                                <GridColumn
                                    title="Item"
                                    field="name"
                                    filterable={true}
                                    cell={(props) => (
                                        <td style={{ minWidth: '200px' }}>
                                            <div>Name: <span className='fw-bold'>{props.dataItem.name}</span></div>
                                            <div>Code: <span className='fw-bold'>{props.dataItem.code}</span></div>
                                        </td>
                                    )}
                                    headerStyle={{ minWidth: '200px' }}
                                    cellStyle={{ minWidth: '200px' }}
                                />
                                <GridColumn
                                    field="currentStock"
                                    title="Current Stock"
                                    width="150px"
                                    headerStyle={{ minWidth: '150px' }}
                                    cellStyle={{ minWidth: '150px' }}
                                />
                                <GridColumn
                                    field="minimumStock"
                                    title="Minimum Stock"
                                    width="150px"
                                    headerStyle={{ minWidth: '150px' }}
                                    cellStyle={{ minWidth: '150px' }}
                                />
                            </Grid>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReorderLevelReport;