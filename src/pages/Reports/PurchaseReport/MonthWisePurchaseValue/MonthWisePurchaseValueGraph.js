import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jan',
    noOfPo: 4000,
    noOfInvoice: 2400,
    amt: 2400,
  },
  {
    name: 'Feb',
    noOfPo: 3000,
    noOfInvoice: 1398,
    amt: 2210,
  },
  {
    name: 'Mar',
    noOfPo: 9800,
    noOfInvoice: 2000,
    amt: 2290,
  },
  {
    name: 'Apr',
    noOfPo: 2780,
    noOfInvoice: 3908,
    amt: 2000,
  },
  {
    name: 'May',
    noOfPo: 1890,
    noOfInvoice: 4800,
    amt: 2181,
  },
  {
    name: 'Jun',
    noOfPo: 2390,
    noOfInvoice: 3800,
    amt: 2500,
  },
  {
    name: 'Jul',
    noOfPo: 4490,
    noOfInvoice: 2000,
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

export default class MonthWisePurchaseValueGraph extends PureComponent {
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
              dataKey="noOfInvoice"
              stroke="#1c13ca"
              label={<CustomizedLabel />}
              name="No of P.O."
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="noOfPo"
              stroke="#03a03f"
              label={<CustomizedLabel />}
              name="No of Invoice"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}