import React, { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { PrivateAxios } from '../../environment/AxiosInstance';
import Loader from '../landing/loder/Loader';
import { SuccessMessage } from '../../environment/ToastMessage';

function PosOrder() {
    const [loading, setLoading] = useState(false);
    const [department, setDepartment] = useState({
        id: null,
        low_stock_order: 0,
        pos_link_with_sales: 0,
    });
console.log(department);

    useEffect(() => {
        setLoading(true);
        PrivateAxios.get(`/get-stockorder-setting`)
            .then((res) => {
                const { id, low_stock_order, pos_link_with_sales } = res.data.data;
                setDepartment({
                    id,
                    low_stock_order: Number(low_stock_order),
                    pos_link_with_sales: Number(pos_link_with_sales)
                });
            })
            .catch((err) => {
                console.error("Failed to fetch setting:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const statusChange = (key, value) => {
        setLoading(true);

        const updatedData = {
            ...department,
            [key]: value,
        };

        PrivateAxios.put(`/update-stockorder`, updatedData)
            .then((res) => {
                setDepartment((prev) => ({ ...prev, [key]: value }));
                SuccessMessage(res.data.data);
            })
            .catch((err) => {
                console.error("Failed to update status:", err);
            })
            .finally(() => setLoading(false));
    };

    return (
        <>
            {loading ? <Loader /> : (
                <div className='p-4'>
                    <div className='card'>
                        <div className='compare_price_view_table'>
                            <Table responsive className="table-bordered primary-table-head">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Low Stock POS Order</td>
                                        <td>
                                            <label className="custom-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={department.low_stock_order === 1}
                                                    onChange={(e) =>
                                                        statusChange("low_stock_order", e.target.checked ? 1 : 0)
                                                    }
                                                    disabled={!department.id}
                                                />
                                                <div className="switch-slider switch-round" />
                                            </label>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>POS link with Sales</td>
                                        <td>
                                            <label className="custom-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={department.pos_link_with_sales === 1}
                                                    onChange={(e) =>
                                                        statusChange("pos_link_with_sales", e.target.checked ? 1 : 0)
                                                    }
                                                    disabled={!department.id}
                                                />
                                                <div className="switch-slider switch-round" />
                                            </label>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PosOrder;
