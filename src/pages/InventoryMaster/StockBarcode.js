import React, { useState, useEffect } from 'react'
import { Alert, Dropdown, Modal, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import { width } from '@mui/system';
import InventoryMasterBarcodeHeader from "./inventoryHeader";
import { UserAuth } from "../auth/Auth";
import { PrivateAxios } from '../../environment/AxiosInstance';
import Loader from "../../environment/Loader";
import { formatDateManual } from "../../environment/DateFormat";
import ItemMasterStatusBar from './itemMaster/ItemMasterStatusBar';
import InventoryMasterPageTopBar from './itemMaster/InventoryMasterPageTopBar';
// Fetch data from API


function InventoryMaster() {
    const { isLoading, setIsLoading, Logout } = UserAuth()
    const [productsdata, setProducts] = useState([]);
    const [getSKU, setSKU] = useState([]);
    const [stores, setStores] = useState([]);
    const [units, setUnit] = useState([]);
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await PrivateAxios.get('product/getallactivity');
          setProducts(response.data.data); // Assuming response.data.data holds the product array
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, []);
 
  // Create a map of store_id to store name for easy lookup
      // SKU name diplay
  useEffect(() => {
    const fetchSKU = async () => {
        try {
            const response = await PrivateAxios.get('product/list');
            setSKU(response.data.data || []); // Ensure data exists
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    fetchSKU();
}, []);


const storeItem = getSKU.reduce((map, sku) => {
    map[sku.id] = sku.product_code;
    return map;
}, {});

 // store name diplay
 useEffect(() => {
    const fetchStores = async () => {
        try {
            const response = await PrivateAxios.get('warehousesselect');
            setStores(response.data.data || []); // Ensure data exists
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    fetchStores();
}, []);

// Create a map of store_id to store name for easy lookup
const storeMap = stores.reduce((map, store) => {
    map[store.id] = store.name;
    return map;
}, {});


useEffect(() => {
    const fetchUnit = async () => {
        try {
            const response = await PrivateAxios.get('getuom');
            setUnit(response.data.data || []); // Ensure data exists
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };
    fetchUnit();
}, []);

const storeUnit = units.reduce((map, unit) => {
    map[unit.id] = unit.unit_name;
    return map;
}, {});
 

let runningBalance = {}; // To store running balances for each product

const dataSource = productsdata.map((item, index) => {
  const productId = item.product_id;
  
  // Initialize the balance for the product if it hasn't been done yet
  if (!runningBalance[productId]) {
    runningBalance[productId] = 0;
  }

  // Calculate Quantity In and Quantity Out
  const qtyIn = item.status_in_out > 0 ? item.quantity_changed : 0;
  const qtyOut = item.status_in_out < 1 ? item.quantity_changed : 0;

  // Update running balance for the product
  runningBalance[productId] += qtyIn - qtyOut;

  return {
    key: index, // Setting a unique key for each row
    barcodenumber: item.barcode_number || '',
    documentnumber: (
        <a 
          href={`/inventory/view_document_approval/${item.reference_number}/${item.id}/${item.quantity_changed}/${runningBalance[productId]}`} 
          className="text-primary"
        >
          {item.reference_number || 'N/A'}
        </a>
      ),
    itemid: storeItem[item.product_id] || 'Loading..',
    itemname: item.item_name || '',
    qtyin: item.status_in_out > 0 
      ? `${item.quantity_changed} ${!isNaN(item.item_unit) ? storeUnit[item.item_unit] : item.item_unit}` 
      : '-',
    qtyout: item.status_in_out < 1 
      ? `${item.quantity_changed} ${!isNaN(item.item_unit) ? storeUnit[item.item_unit] : item.item_unit}` 
      : '-',
    balquery: `${runningBalance[productId]} ${!isNaN(item.item_unit) ? storeUnit[item.item_unit] : item.item_unit}`, // Updated Balance Quantity
    fromstore: item.status_in_out == 0 ? storeMap[item.store_id] : '',
    tostore: item.status_in_out == 1 ? storeMap[item.store_id] : '',
    createduser: formatDateManual(item.created_at) || '',
    status: item.printed_v == 0 ? 'Not Print' : 'Printed',
  };
});
    const columns = [
        {
            title: 'Barcode Number',
            dataIndex: 'barcodenumber',
            key: 'barcodenumber',
            width: 160,
            sorter: true,
        },
        {
            title: 'Document Number',
            dataIndex: 'documentnumber',
            key: 'documentnumber',
            fixed: 'left',
            width: 200,
            sorter: true,
        },
        {
            title: 'Item Id',
            dataIndex: 'itemid',
            key: 'itemid',
            width: 200,
            sorter: true,
        },
        {
            title: 'Item Name',
            dataIndex: 'itemname',
            key: 'itemname',
            width: 170,
            sorter: true,
        },
        {
            title: 'Quantity In',
            dataIndex: 'qtyin',
            key: 'qtyin',
            width: 130,
            sorter: true,
        },
        {
            title: 'Quantity Out',
            dataIndex: 'qtyout',
            key: 'qtyout',
            width: 130,
            sorter: true,
        },
        {
            title: 'Balance Quantity',
            dataIndex: 'balquery',
            key: 'balquery',
            width: 160,
            sorter: true,
        },
        {
            title: 'From Store',
            dataIndex: 'fromstore',
            key: 'fromstore',
            width: 280,
            sorter: true,
        },
        {
            title: 'To Store',
            dataIndex: 'tostore',
            key: 'tostore',
            width: 280,
            sorter: true,
        },
        {
            title: 'Created By',
            dataIndex: 'createduser',
            key: 'createduser',
            width: 180,
            sorter: true,
        },
        {
            title: 'Print Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            sorter: true,
        },
        
    ];
    
    return (
        <React.Fragment>
             {isLoading?  <Loader />:
        <>
            {/* <InventoryMasterBarcodeHeader /> */}
            <InventoryMasterPageTopBar />
            <ItemMasterStatusBar />
            <div className='p-4'>
            <div className='inventory-body '>
                {/* <div className='inventory-body-wrap-header d-flex flex-wrap justify-content-between mb-3'>
                    <h5 className='d-flex align-items-center'>
                    Barcode
                        <OverlayTrigger placement="top" overlay={<Tooltip>
                            This page shows list of all the Stock Barcode.
                        </Tooltip>
                        }
                        >
                            <span className='cursor-pointer ms-2 text-muted'><i
                                className="fas fa-info-circle f-s-16 line-height-1"></i></span>
                        </OverlayTrigger>
                    </h5>
                   
                </div> */}
                <div className='inventory-body-wrap-body'>
                    
                    <div className='table-wrap'>
                        <div className="shadow rounded-10 bg-white">
                            <div className='d-flex justify-content-end p-3'>
                                <div className='col-md-3'>
                                    <input type='text' placeholder='Search...' className='form-control' />
                                </div>
                            </div>
                            <div className="p-0">
                                <Table
                                    dataSource={dataSource}
                                    columns={columns}
                                    scroll={{ x: 1300 }}
                                    pagination={true}
                                    bordered
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
           
        </>}
        </React.Fragment >
    )
}

export default InventoryMaster