import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {
  PrivateAxios,
  PrivateAxiosFile,
  url,
} from "../../../../environment/AxiosInstance";
import { ErrorMessage } from '../../../../environment/ToastMessage';

const CustomerDispatchModal = ({
  lgShow,
  setLgShow,
  data,
  type,
  productId,
  
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [currentStock, setCurrentStock] = useState(null);
const [stores, setStores] = useState([]);


const extractNumericPrice = (priceString) => {
  const matched = priceString.match(/[\d.]+/);
  return matched ? parseFloat(matched[0]) : 0;
};
const handleConfirmDispatchCustomer = async () => {
  try {
    const stockRes = await PrivateAxios.post("sales/dispatch/deductStock", {
      product_id: data?.[0]?.product_id ,
      product_name: data?.[0]?.product_name ,
      unit:data?.[0]?.unit,
      default_price: extractNumericPrice(data?.[0]?.total_tax_incl),

      store_id: selectedStoreId,
      quantity: data?.[0]?.qty,

    });

    if (stockRes.status !== 200) {
      ErrorMessage("Stock deduction failed. Dispatch aborted.");
      return;
    }


    const res = await PrivateAxios.post("sales/production/is_invoice", {
      id: data?.[0]?.id,
      production_id: data?.[0]?.production_number,
    });

    if (res.status === 200) {
      window.location.href = `/payment/document/tax-invoice/${data?.[0]?.id}`;
    } else {
      ErrorMessage("Failed to generate invoice.");
    }

  } catch (error) {
    console.error("Error during dispatch to customer:", error);
    ErrorMessage("Dispatch failed. Please try again.");
  } finally {
   
  }
};
  // Function to fetch stock for selected store
  const getStockOfStore = async (storeId) => {
    try {
      const response = await PrivateAxios.get(`/sales/dispatch/stockUpdate/${data?.[0]?.product_id}/${storeId}`);
      return response.data.stock; 
    } catch (error) {
      console.error('Error fetching stock:', error);
      return 0;
    }
  };
useEffect(() => {
    // Fetch stores
    const fetchStores = async () => {
      const result = await PrivateAxios.get("/warehouse");
      const filteredStores = result.data.data.filter(
        (store) => store.store_type === "In-Stock Stores"
      );
      setStores(filteredStores);
    };
    fetchStores();
  }, []);
  return (
    <>
    
    <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
          <Modal.Header closeButton>
            <Modal.Title>Dispatch to Customer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Store Selector */}
            <div className="mb-3">
              <label className="form-label">Select Store</label>
              <select
                className="form-select"
                value={selectedStoreId}
                onChange={async (e) => {
                  const storeId = e.target.value;
                  setSelectedStoreId(storeId);
                  const stock = await getStockOfStore(storeId);
                  setCurrentStock(stock);
                }}
              >
                <option value="">-- Select Store --</option>
                {stores.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Display */}
            {selectedStoreId && (
              <div className="mb-3">
                <label className="form-label">Current Stock</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    currentStock !== null
                      ? `${currentStock} ${data?.[0]?.unit}`
                      : 'Loading...'
                  }
                  readOnly
                />
              </div>
            )}

            {/* Stock Warning */}
            {currentStock !== null && currentStock <= 0 && (
              <div className="text-danger">
                Stock not available in the selected store.
              </div>
            )}
          </Modal.Body>
          {currentStock >= data?.[0]?.qty && (
          <Modal.Footer>
            
          
              <Button
                variant="primary"
                onClick={() => handleConfirmDispatchCustomer()}
              >
                Submit
              </Button>
          
          </Modal.Footer>
        )}
        </Modal>
      
    </>
  );
};

export default CustomerDispatchModal;