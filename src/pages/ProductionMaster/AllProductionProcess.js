import React, { useState, useEffect } from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
} from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { PDFExport } from "@progress/kendo-react-pdf";
// import "@progress/kendo-theme-default/dist/all.css";
import { Button } from "@progress/kendo-react-buttons";

function AllProductionProcess() {
  // Simulate a data loading process (you can replace this with an API call)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  

  // State for grid data and data operations
  const [dataState, setDataState] = useState({
    skip: 0,
    take: 5,
    sort: [],
    filter: null,
  });

  const pdfExportRef = React.createRef();
  const excelExportRef = React.createRef();

  // Simulate data loading with useEffect
  useEffect(() => {
    const loadData = () => {
      // Static data (can be replaced with an API call)
      const sampleData = [
        { id: 1, name: "Sig Jeannel", jobTitle: "Engineer", country: "USA", status: "Online", rating: 5 },
        { id: 2, name: "Shelden Greyes", jobTitle: "Manager", country: "UK", status: "Offline", rating: 4 },
        { id: 3, name: "Megen Cody", jobTitle: "Operator", country: "Brazil", status: "Online", rating: 3 },
        { id: 4, name: "Clevey Thursfield", jobTitle: "VP Quality Control", country: "Brazil", status: "Online", rating: 5 },
        { id: 5, name: "Ruthi Baldini", jobTitle: "Data Coordinator", country: "USA", status: "Offline", rating: 4 },
        { id: 6, name: "Anne Morter", jobTitle: "Professor", country: "France", status: "Offline", rating: 4 },
        { id: 7, name: "John Smith", jobTitle: "Analyst", country: "India", status: "Online", rating: 4 },
      ];
      setData(sampleData);
      setLoading(false); // Set loading to false once data is loaded
    };

    loadData();
  }, []);

  const handleExportPDF = () => {
    if (pdfExportRef.current) {
      pdfExportRef.current.save();
    }
  };

  const handleExportExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

  const handleEdit = (id) => {
    alert(`Edit clicked for ID: ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Delete clicked for ID: ${id}`);
  };

  const ActionCell = (props) => {
    const { dataItem } = props;
    return (
      <td>
        <div className="d-flex gap-2">
          <button
            onClick={() => handleEdit(dataItem.id)}
            title="Edit"
            className="icon-btn"
          >
            <i className="fas fa-pen"></i>
          </button>
          <button
            onClick={() => handleDelete(dataItem.id)}
            title="Delete"
            className="icon-btn"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    );
  };

  // Custom column menu icon
  const CustomColumnMenuIcon = () => (
    <span className="k-icon k-i-filter" style={{ fontSize: "20px", color: "blue" }}></span>
  );

  return (
    <>
      <div className="row">
        <div className="col-12">
          <h5 className="mb-4">Bill of Material (BOM)</h5>
        </div>
        <div className="col-12">
          <GridToolbar className="border-0">
            <button type='button' className="k-button" onClick={handleExportPDF}>
              Export to PDF
            </button>
            <button type='button' className="k-button" onClick={handleExportExcel}>
              Export to Excel
            </button>
          </GridToolbar>
          <div className="bg_succes_table_head">
            <PDFExport ref={pdfExportRef}>
              <ExcelExport ref={excelExportRef}>
                <Grid
                  style={{ height: "400px" }}
                  data={process(data, dataState)}
                  filterable
                  sortable
                  pageable
                  scrollable="scrollable"
                  reorderable
                  resizable // Enable column resizing
                  {...dataState}
                  onDataStateChange={(e) => setDataState(e.dataState)}
                  loading={loading} // Display loading indicator when data is loading
                >
                  {/* Add ID column */}
                  <GridColumn field="id" title="ID" resizable />
                  <GridColumn field="number" title="number" columnMenuIcon={CustomColumnMenuIcon} resizable />
                  <GridColumn field="jobTitle" title="Job Title" columnMenuIcon={CustomColumnMenuIcon} resizable />
                  <GridColumn field="country" title="Country" columnMenuIcon={CustomColumnMenuIcon} resizable />
                  <GridColumn field="status" title="Status" columnMenuIcon={CustomColumnMenuIcon} resizable />
                  <GridColumn field="rating" title="Rating" filter="numeric" columnMenuIcon={CustomColumnMenuIcon} resizable />
                  {/* Actions column with no filtering */}
                  <GridColumn title="Actions" cell={ActionCell} width="150px" filterable={false} />
                </Grid>
              </ExcelExport>
            </PDFExport>
          </div>
        </div>
      </div>
    </>
  );
}

export default AllProductionProcess;
