import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';

import { PrivateAxios, PrivateAxiosFile } from '../../../../environment/AxiosInstance';
import { UserAuth } from '../../../auth/Auth';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);



function InventoryValuationSummary() {
    const { isLoading, setIsLoading, Logout, getGeneralSettingssymbol } = UserAuth();
   const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchInventoryData();
    }, []);

 const fetchInventoryData = async () => {
    try {
        const response = await PrivateAxios.get('/product/list');
        console.log("API raw response:", response.data); // Debug log

        // Determine correct array path
        const apiData = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
                ? response.data.data
                : [];

        if (apiData.length === 0) {
            console.warn("No data found in the API response");
        }

        const formattedData = apiData.map((item, index) => {
            const current_stock = Number(item.current_stock || 0);
            const product_price = Number(item.product_price || 0);
             const unit_name = item.Masteruom?.unit_name || 'Units';
            return {
                id: index + 1,
                name: item.product_name || "N/A",
                code: item.product_code || "N/A",
                category: item?.Categories?.title || "N/A",
                current_stock,
                unit_name,
                product_price,
                stock_value: current_stock * product_price,
            };
        });

        setData(formattedData);
    } catch (error) {
        console.error("Error fetching product data:", error);
    }
};
const filteredData = process(data, { filter }).data;

    // Generate dynamic HSL-based color palette
    const generateColorPalette = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360) / count;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    };

    const categoryMap = {};

filteredData.forEach(item => {
  const category = item.category || "Uncategorized";
  if (!categoryMap[category]) {
    categoryMap[category] = 0;
  }
  categoryMap[category] += item.stock_value;
});

// 2. Prepare labels and data arrays
const categoryLabels = Object.keys(categoryMap);
const categoryValues = Object.values(categoryMap);

// 3. Generate colors dynamically for categories
const categoryColors = generateColorPalette(categoryLabels.length);

// 4. Prepare doughnut data for categories
const doughnutData = {
  labels: categoryLabels,
  datasets: [{
    data: categoryValues,
    backgroundColor: categoryColors,
    hoverBackgroundColor: categoryColors,
    hoverBorderColor: "rgba(234, 236, 244, 1)",
  }]
};

    const doughnutOptions = {
        maintainAspectRatio: false,
       plugins: {
        legend: {
             position: 'bottom',
            labels: {
                font: {
                    size: 10
                },
               
             
                    usePointStyle: true,
                    padding: 20
                
            }
        },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${getGeneralSettingssymbol}${value.toFixed(2)}`;
                    }
                }
            }
        },
        cutout: '70%'
    };

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button
                    className="btn link-btn text-dark"
                    onClick={() => window.history.back()}
                    startIcon={<i className="fas fa-long-arrow-alt-left me-1" />}
                >
                    Back
                </Button>
            </div>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title mb-0'>Inventory Valuation Summary</h4>
                </div>
                <div className='card-body p-4'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <div className='table-responsive'>
                                <Grid
                                    data={process(data, { filter })}
                                    filterable={true}
                                    filter={filter}
                                    onFilterChange={(e) => setFilter(e.filter)}
                                    style={{ width: '100%' }}
                                >
                                    <GridColumn field="id" title="#" width="80px" headerClassName="fw-bold" />
                                    <GridColumn
                                        title="Item"
                                        field="name"
                                        width="200px"
                                        cell={(props) => (
                                            <td>
                                                <div>Name: <strong>{props.dataItem.name}</strong></div>
                                                <div>Code: <strong>{props.dataItem.code}</strong></div>
                                            </td>
                                        )}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn field="category" title="Category" width="150px" headerClassName="fw-bold" />
                                    <GridColumn
                                        field="current_stock"
                                        title="Current Stock"
                                        width="150px"
                                        cell={(props) => (
                                        <td>
                                            {props.dataItem.current_stock} {props.dataItem.unit_name}
                                        </td>
                                    )}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="product_price"
                                        title="Unit Price"
                                        width="150px"
                                        headerClassName="fw-bold text-end"
                                        cell={(props) => (
                                            <td className='text-end'>{getGeneralSettingssymbol}{props.dataItem.product_price.toFixed(2)}</td>
                                        )}
                                    />
                                    <GridColumn
                                        field="stock_value"
                                        title="Stock Value"
                                        width="150px"
                                        headerClassName="fw-bold text-end"
                                        cell={(props) => (
                                            <td className='text-end'>{getGeneralSettingssymbol}{props.dataItem.stock_value.toFixed(2)}</td>
                                        )}
                                    />
                                </Grid>
                            </div>
                        </div>
                        <div className='col-lg-4 mt-4 mt-lg-0'>
                            <div className='card h-100'>
                                <div className='card-header'>
                                    <h5 className='card-title mb-0'>Value Distribution</h5>
                                </div>
                                <div className='card-body d-flex flex-column'>
                                    <div className='chart-pie pt-4 pb-2'>
                                        <Doughnut
                                            data={doughnutData}
                                            options={doughnutOptions}
                                            height={400}
                                        />
                                    </div>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryValuationSummary;