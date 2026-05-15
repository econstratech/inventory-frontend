import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { PrivateAxios } from '../../../environment/AxiosInstance';

function CustomerNotTurnUp() {
    const [tableData, setTableData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        PrivateAxios.get("/pos/customer-not-turn-up", {
            params: {
                page: pagination.current,
                limit: pagination.pageSize,
            },
        })
            .then((res) => {
                const data = res.data?.data || {};
                const rows = (data.rows || []).map((item, idx) => ({
                    _key: item.customer_id ?? idx,
                    customerName: item.customer_name,
                    phone: item.customer_phone,
                    email: item.customer_email || '',
                    lastPurchaseDate: item.last_purchase_date
                        ? moment(item.last_purchase_date).format("DD/MM/YYYY")
                        : '-',
                }));
                setTableData(rows);
                setPagination((prev) => ({
                    ...prev,
                    total: data.pagination?.total_records || 0,
                }));
            })
            .catch((err) => console.error("Error fetching customer data:", err))
            .finally(() => setLoading(false));
    }, [pagination.current, pagination.pageSize]);

    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
            width: 200,
        },
        {
            title: 'Last Purchase Date',
            dataIndex: 'lastPurchaseDate',
            key: 'lastPurchaseDate',
            width: 180,
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
        },
    ];

    return (
        <div className='card'>
            <div className='card-header d-flex justify-content-between align-items-center flex-wrap '>
                <div>
                    <h5 className='card-title'>Customer Not Turn Up</h5>
                    <p className='mb-0'>(Last 6 months data)</p>
                </div>
            </div>
            <div className='card-body p-0'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='table-responsive mb-0'>
                            <Table
                                rowKey={(record) => record._key}
                                columns={columns}
                                dataSource={tableData}
                                loading={loading}
                                pagination={{
                                    current: pagination.current,
                                    pageSize: pagination.pageSize,
                                    total: pagination.total,
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} customers`,
                                }}
                                onChange={(p) =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        current: p.current,
                                        pageSize: p.pageSize,
                                    }))
                                }
                                scroll={{ x: 'max-content' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerNotTurnUp;
