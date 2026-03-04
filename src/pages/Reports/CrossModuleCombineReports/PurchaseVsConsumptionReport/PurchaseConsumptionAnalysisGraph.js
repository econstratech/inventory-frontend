// import React, { PureComponent } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Area,
//   AreaChart,
//   Legend,
// } from 'recharts';

// const data = [
//   { name: 'Jan', consumption: 4000, purchase: 2400 },
//   { name: 'Feb', consumption: 3000, purchase: 1398 },
//   { name: 'Mar', consumption: 9800, purchase: 2000 },
//   { name: 'Apr', consumption: 2780, purchase: 3908 },
//   { name: 'May', consumption: 1890, purchase: 4800 },
//   { name: 'Jun', consumption: 2390, purchase: 3800 },
//   { name: 'Jul', consumption: 4490, purchase: 2000 },
// ];

// export default class DualLineGradientChart extends PureComponent {
//   render() {
//     return (
//       <div style={{ width: '100%', height: 250 }}>
//         <ResponsiveContainer>
//           <AreaChart
//             data={data}
//             margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
//           >
//             <defs>
//               <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#067ec3" stopOpacity={0.7} />
//                 <stop offset="100%" stopColor="#067ec3" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#139231" stopOpacity={0.7} />
//                 <stop offset="100%" stopColor="#139231" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Legend /> {/* <- This line adds the legend */}
//             <Area
//               type="monotone"
//               dataKey="consumption"
//               stroke="#067ec3"
//               fillOpacity={1}
//               fill="url(#colorConsumption)"
//               dot={{ stroke: '#067ec3', strokeWidth: 2, r: 4, fill: 'white' }}
//               activeDot={{ r: 6 }}
//               name="Consumption"
//             />
//             <Area
//               type="monotone"
//               dataKey="purchase"
//               stroke="#139231"
//               fillOpacity={1}
//               fill="url(#colorPurchase)"
//               dot={{ stroke: '#139231', strokeWidth: 2, r: 4, fill: 'white' }}
//               activeDot={{ r: 6 }}
//               name="Purchase"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     );
//   }
// }


import React from 'react';
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

const data = [
  { name: 'Jan', consumption: 4000, purchase: 2400 },
  { name: 'Feb', consumption: 3000, purchase: 1398 },
  { name: 'Mar', consumption: 9800, purchase: 2000 },
  { name: 'Apr', consumption: 2780, purchase: 3908 },
  { name: 'May', consumption: 1890, purchase: 4800 },
  { name: 'Jun', consumption: 2390, purchase: 3800 },
  { name: 'Jul', consumption: 4490, purchase: 2000 }
];

const CustomizedLabel = ({ x, y, stroke, value }) => {
  return (
    <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
      {value}
    </text>
  );
};

const CustomizedAxisTick = ({ x, y, stroke, payload }) => {
  return (
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
};

const PurchaseConsumptionAnalysisGraph = () => {
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 40,
            right: 40,
            left: 10,
            bottom: 30
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={<CustomizedAxisTick />} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="consumption"
            stroke="#007bff"
            label={<CustomizedLabel />}
            name="Consumption"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="purchase"
            stroke="#28a745"
            label={<CustomizedLabel />}
            name="Purchase"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PurchaseConsumptionAnalysisGraph;
