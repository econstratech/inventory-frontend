import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function StockSaleAnalysisGraph({ data = [] }) {
    const chartData = data.map(item => ({
        month: item.month,
        in: item.total_in,
        out: item.total_out,
        final: item.final_stock
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="in" stackId="a" fill="#4caf50" name="Stock In" />
                <Bar dataKey="out" stackId="a" fill="#f44336" name="Stock Out" />
                <Bar dataKey="final" fill="#2196f3" name="Final Stock" />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default StockSaleAnalysisGraph;
