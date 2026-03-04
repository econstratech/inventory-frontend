import React from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportPDF = (columns, data, pdfName) => {
    const doc = new jsPDF();
    const tableColumn = columns.map(col => col.name);
    const tableRows = [];
    var i = 1;
    data.forEach((item) => {

        const dataRow = columns.map((col) =>
            col.name == "Sl No." ? i : col.selector(item)
        );
        tableRows.push(dataRow);
        i++;
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text(`${pdfName}`, 14, 15);
    doc.save(`${pdfName}.pdf`);
};

export const exportExcel = (columns, data, name) => {
    var i = 1;
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => {
        const row = {};
        columns.forEach(col => {
            col.name == "Sl No." ? row[col.name] = i : row[col.name] = col.selector(item);
        });
        i++;
        return row;

    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${name}.xlsx`);
};

export const printTable = (columns, data, pdfName) => {
    const tableColumn = columns.map(col => col.name);
    const tableRows = [];
    var i = 1;
    data.forEach(item => {
        const dataRow = columns.map(col => col.name == "Sl No." ? i : col.selector(item));
        tableRows.push(dataRow);
        i++;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>${pdfName} Table</title>`);
    printWindow.document.write('<style>');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('th, td { border: 1px solid black; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>${pdfName} Table</h1>`);
    printWindow.document.write('<table><thead><tr>');

    // Add table headers
    tableColumn.forEach(column => {
        printWindow.document.write(`<th>${column}</th>`);
    });
    printWindow.document.write('</tr></thead><tbody>');

    // Add table rows
    tableRows.forEach(row => {
        printWindow.document.write('<tr>');
        row.forEach(cell => {
            printWindow.document.write(`<td>${cell}</td>`);
        });
        printWindow.document.write('</tr>');
    });

    printWindow.document.write('</tbody></table></body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
};