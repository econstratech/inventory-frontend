import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PrivateAxios, url } from "../../environment/AxiosInstance";
import { UserAuth } from "../auth/Auth";
import Loader from "../../environment/Loader";
const GENpdf = () => {
  const [data, setData] = useState(null);

  const generatePDF = async () => {
    try {
      const response = await PrivateAxios.get("purchase/purchase/57");
      const jsonData = response.data;
      setData(jsonData); // Assuming your API returns JSON data
      console.log(jsonData);

      if (jsonData) {
        const doc = new jsPDF();
        doc.setFontSize(12);

        // Add header information
        doc.text("Gopal Infotech", 20, 20);
        doc.text("Saltlake", 20, 30);
        doc.text(" +91 98546 34543", 20, 40);
        doc.text(`Purchase Order #${jsonData.purchase_order_number}`, 150, 20);

        doc.text(`Purchase Representative: ${jsonData.buyer}`, 20, 60);
        doc.text(
          `Order Date: ${new Date(jsonData.order_dateline).toLocaleString()}`,
          20,
          70
        );

        // Add table headers
        const headers = [
          ["Description", "Taxes", "Date Req.", "Qty", "Unit Price", "Amount"],
        ];
        const products = jsonData.products.map((product) => [
          product.description,
          `${product.tax}%`,
          new Date(product.updated_at).toLocaleString(),
          product.qty,
          `₹${parseFloat(product.unit_price).toFixed(2)}`,
          `₹${parseFloat(product.taxIncl).toFixed(2)}`,
        ]);

        doc.autoTable({
          startY: 80,
          head: headers,
          body: products,
        });

        // Add totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(
          `Untaxed Amount: ₹${parseFloat(jsonData.untaxed_amount).toFixed(2)}`,
          20,
          finalY
        );
        doc.text(`SGST: ₹${parseFloat(jsonData.sgst).toFixed(2)}`, 20, finalY + 10);
        doc.text(`CGST: ₹${parseFloat(jsonData.cgst).toFixed(2)}`, 20, finalY + 20);
        doc.text(
          `Total: ₹${parseFloat(jsonData.total_amount).toFixed(2)}`,
          20,
          finalY + 30
        );

        doc.save("purchase_order.pdf");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <button type='button' onClick={generatePDF}>Generate PDF</button>
    </div>
  );
};

export default GENpdf;