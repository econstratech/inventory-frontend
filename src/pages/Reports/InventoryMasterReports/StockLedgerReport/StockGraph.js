import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    saleValue: 4000,
    purchaseValue: 2400,
    amt: 2400,
  },
  {
    name: 'Feb',
    saleValue: 3000,
    purchaseValue: 1398,
    amt: 2210,
  },
  {
    name: 'Mar',
    saleValue: 9800,
    purchaseValue: 2000,
    amt: 2290,
  },
  {
    name: 'Apr',
    saleValue: 2780,
    purchaseValue: 3908,
    amt: 2000,
  },
  {
    name: 'May',
    saleValue: 1890,
    purchaseValue: 4800,
    amt: 2181,
  },
  {
    name: 'Jun',
    saleValue: 2390,
    purchaseValue: 3800,
    amt: 2500,
  },
  {
    name: 'Jul',
    saleValue: 4490,
    purchaseValue: 2000,
    amt: 2100,
  },
];

class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, stroke, value } = this.props;

    return (
      <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
        {value}
      </text>
    );
  }
}

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

export default class StockGraph extends PureComponent {
  render() {
    return (
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 40,
              right: 40,
              left: 10,
              bottom: 30, // Increased bottom margin to accommodate rotated labels
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={<CustomizedAxisTick />}
            />
            <YAxis />
            <Tooltip
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="purchaseValue"
              stroke="#1c13ca"
              label={<CustomizedLabel />}
              name="Purchase"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="saleValue"
              stroke="#03a03f"
              label={<CustomizedLabel />}
              name="Sale"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}