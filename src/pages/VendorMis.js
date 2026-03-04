import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Product 1', minPrice: 2.2, lastPrice: 256.36, maxPrice: 552.23, quantity: 507, potentialSavings: 317.44, currentSavings: 2389, spend: 156503 },
  { name: 'Product 2', minPrice: 5263.23, lastPrice: 5256.13, maxPrice: 12456.8, quantity: 42, potentialSavings: 8139.87, currentSavings: 12320, spend: 328123 },
  { name: 'Product 3', minPrice: 1.23, lastPrice: 258.38, maxPrice: 583.21, quantity: 320, potentialSavings: 324.83, currentSavings: 4328, spend: 94898 },
  { name: 'Product 4', minPrice: 236.45, lastPrice: 655.23, maxPrice: 789.26, quantity: 250, potentialSavings: 134.03, currentSavings: 7598, spend: 150583 },
  { name: 'Product 5', minPrice: 250.6, lastPrice: 456.21, maxPrice: 123.69, quantity: 551, potentialSavings: 79.9, currentSavings: 12365, spend: 123859 },
  { name: 'Product 6', minPrice: 25.36, lastPrice: 853.21, maxPrice: 905.34, quantity: 485, potentialSavings: 65.13, currentSavings: 25385, spend: 236987 },
  { name: 'Product 7', minPrice: 23.36, lastPrice: 987.28, maxPrice: 845.01, quantity: 320, potentialSavings: 55.238, currentSavings: 4328, spend: 94898 },
  { name: 'Product 8', minPrice: 236.28, lastPrice: 583.41, maxPrice: 2033.25, quantity: 283, potentialSavings: 1449.84, currentSavings: 23123, spend: 789156 },
  { name: 'Product 9', minPrice: 246.21, lastPrice: 236.35, maxPrice: 444.23, quantity: 320, potentialSavings: 207.88, currentSavings: 4385, spend: 321023 },
];

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

const CustomTable = () => (
  <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>Product Name</TableCell>
          <TableCell align="right">Min Price</TableCell>
          <TableCell align="right">Last Price Paid</TableCell>
          <TableCell align="right">Max Price</TableCell>
          <TableCell align="right">Quantity</TableCell>
          <TableCell align="right">Potential Savings</TableCell>
          <TableCell align="right">Current Savings</TableCell>
          <TableCell align="right">Spend</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={row.name}>
            <TableCell component="th" scope="row">{row.name}</TableCell>
            <TableCell align="right">{row.minPrice}</TableCell>
            <TableCell align="right">{row.lastPrice}</TableCell>
            <TableCell align="right">{row.maxPrice}</TableCell>
            <TableCell align="right">{row.quantity}</TableCell>
            <TableCell align="right">
              <div style={{ width: '100%', height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ value: row.potentialSavings }]}>
                    <XAxis hide type="number" />
                    <Tooltip />
                    <Bar dataKey="value" isAnimationActive={true}>
                      <Cell fill={COLORS[index % COLORS.length]} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TableCell>
            <TableCell align="right">{row.currentSavings}</TableCell>
            <TableCell align="right">{row.spend}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default CustomTable;
