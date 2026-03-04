import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ReactComponent as DownloadIcon } from './icon/file-download.svg';
import moment from 'moment';
import { PrivateAxios } from '../../../environment/AxiosInstance';

const CustomizedLabel = ({ x, y, stroke, value }) => (
    <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
        {value}
    </text>
);

const CustomizedAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
        <text
            x={0}
            y={0}
            dy={16}
            textAnchor="end"
            fill="#666"
            transform="rotate(-35)"
        >
            {payload.value}
        </text>
    </g>
);

const SalesGraph = () => {
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        PrivateAxios.get("/pos/getAllOrdersWithItems")
            .then((res) => {
                const allOrders = res.data;

                // Filter orders from the last 6 months
                const sixMonthsAgo = moment().subtract(6, 'months');
                const recentOrders = allOrders.filter(order =>
                    moment(order.created_at).isAfter(sixMonthsAgo)
                );

                const monthlySales = {};

                recentOrders.forEach(order => {
                    const monthKey = moment(order.created_at).format("MMM YYYY");
                    if (!monthlySales[monthKey]) {
                        monthlySales[monthKey] = 0;
                    }
                    monthlySales[monthKey] += 1;
                });

                const chartData = Object.entries(monthlySales)
                    .sort(([a], [b]) => moment(a, "MMM YYYY") - moment(b, "MMM YYYY"))
                    .map(([month, sales]) => ({
                        name: month,
                        sales
                    }));

                setGraphData(chartData);
            })
            .catch(err => {
                console.error("Error loading sales data", err);
            });
    }, []);

    return (
        <div className='card'>
            <div className='card-header d-flex align-items-center flex-wrap gap-2'>
                <div>
                    <h5 className='card-title'>Sales</h5>
                    <p className='mb-0'>(Last 6 months data)</p>
                </div>
                {/* <button className='btn btn-sm btn-outline-primary ms-auto'>
                    <DownloadIcon width={14} height={14} /> Download Excel
                </button> */}
            </div>

            <div className='card-body p-0'>
                <div style={{ width: '100%', height: '360px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={graphData}
                            margin={{ top: 40, right: 40, left: 10, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={<CustomizedAxisTick />} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#28a745"
                                label={<CustomizedLabel />}
                                name="Sales"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SalesGraph;
