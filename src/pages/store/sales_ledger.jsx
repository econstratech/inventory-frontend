import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from "dayjs";
import Form from 'react-bootstrap/Form'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Table } from 'antd'

import { PrivateAxios } from '../../environment/AxiosInstance'
import { ErrorMessage } from '../../environment/ToastMessage'
import CustomerSelect from '../filterComponents/CustomerSelect'

const DEFAULT_PAGE_SIZE = 15

function SalesLedger () {
  const [vendorId, setVendor] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [ledgerRows, setLedgerRows] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [hasFetched, setHasFetched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dateError, setDateError] = useState('')

  const fetchLedger = async (page, limit) => {
    setLoading(true)
    try {
      const formattedStartDate = startDate
        ? startDate.toISOString().slice(0, 10)
        : null
      const formattedEndDate = endDate
        ? endDate.toISOString().slice(0, 10)
        : null

      const res = await PrivateAxios.post('/Sales/SalesLedger', {
        customer_id: vendorId?.id || null,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page,
        limit,
      })

      const payload = res.data?.data || {}
      setLedgerRows(Array.isArray(payload.rows) ? payload.rows : [])
      setTotal(Number(payload.total) || 0)
      setCurrentPage(Number(payload.page) || page)
      setPageSize(Number(payload.pageSize) || limit)
      setHasFetched(true)
    } catch (error) {
      console.error('Error fetching ledger:', error)
      ErrorMessage('Failed to fetch sales ledger')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Validate: if start date is provided, end date must be entered and greater than start date
    if (startDate) {
      if (!endDate) {
        setDateError('End date is required when start date is provided')
        ErrorMessage('End date is required when start date is provided')
        return
      }
      if (endDate < startDate) {
        setDateError('End date must be greater than start date')
        ErrorMessage('End date must be greater than start date')
        return
      }
    }
    setDateError('')

    // Always reset to page 1 on a new search
    fetchLedger(1, pageSize)
  }

  const handlePageChange = (page, size) => {
    fetchLedger(page, size)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const payload = {}
      if (vendorId?.id) payload.customer_id = vendorId.id
      if (startDate && endDate) {
        payload.startDate = startDate.toISOString().slice(0, 10)
        payload.endDate = endDate.toISOString().slice(0, 10)
      }

      const response = await PrivateAxios.post(
        '/sales/salesLedger/export',
        payload,
        { responseType: 'blob' }
      )

      const disposition = response.headers['content-disposition']
      let filename = 'sales_ledger.csv'
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/i)
        if (match?.[1]) filename = match[1].trim()
      }

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting ledger:', error)
      ErrorMessage('Failed to export sales ledger')
    } finally {
      setDownloading(false)
    }
  }

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: value => <div className='min-width-200'>{value}</div>,
    },
    {
      title: 'Sale Order No',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: value => (
        <div className='min-width-100'>
          {value ? dayjs(value).format('DD/MM/YYYY') : 'N/A'}
        </div>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, item) => (
        <div className='min-width-100'>
          {`${item.product_name || ''} ${item.weight_per_unit ?? ''} ${item.label ?? ''}`.trim()}
        </div>
      ),
    },
    {
      title: 'Order Qty',
      dataIndex: 'qty',
      key: 'qty',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Received Qty',
      dataIndex: 'total_received_qty',
      key: 'total_received_qty',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Returned Qty',
      dataIndex: 'total_returned_qty',
      key: 'total_returned_qty',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Balance Qty',
      key: 'balance_qty',
      render: (_, item) => (
        <div className='min-width-100'>
          {Number(item.qty || 0) - Number(item.total_received_qty || 0)}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'taxIncl',
      key: 'taxIncl',
      render: value => <div className='min-width-100'>{value}</div>,
    },
  ]

  return (
    <div className='p-4'>
      <h4>Sales Ledger</h4>
      <div className='card'>
        <div className='card-body'>
          <Form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-4 col-md-6'>
                <div className='form-group' id='vendorSelect'>
                  <label for='vendorSelect'>Customer</label>
                  <div className='custom-select-wrap'>
                    <CustomerSelect
                      value={vendorId}
                      onChange={selected => setVendor(selected)}
                      placeholder='Select...'
                    />
                  </div>
                </div>
              </div>

              <div className='col-lg-4 col-md-6'>
                <div className='form-group' id='startDate'>
                  <label for='startDateInput'>Start Date</label>
                  <div className='exp-datepicker-cont'>
                    <span className='cal-icon'>
                      <i className='fas fa-calendar-alt'></i>
                    </span>
                    <DatePicker
                      className='form-control'
                      selected={startDate}
                      onChange={date => {
                        setStartDate(date)
                        if (dateError) setDateError('')
                      }}
                      placeholderText='Start Date'
                      dateFormat='yyyy-MM-dd'
                      maxDate={new Date()}
                    />
                  </div>
                </div>
              </div>

              <div className='col-lg-4 col-md-6'>
                <div className='form-group' id='endDate'>
                  <label for='endDateInput'>End Date</label>
                  <div className='exp-datepicker-cont'>
                    <span className='cal-icon'>
                      <i className='fas fa-calendar-alt'></i>
                    </span>
                    <DatePicker
                      className={`form-control ${dateError ? 'is-invalid' : ''}`}
                      selected={endDate}
                      onChange={date => {
                        setEndDate(date)
                        if (dateError) setDateError('')
                      }}
                      placeholderText='End Date'
                      dateFormat='yyyy-MM-dd'
                      minDate={startDate || undefined}
                      maxDate={new Date()}
                    />
                  </div>
                  {dateError && (
                    <small className='text-danger'>{dateError}</small>
                  )}
                </div>
              </div>

              <div className='col-md-12 d-flex align-items-end justify-content-end'>
                <Button type='submit' variant='primary' disabled={loading}>
                  {loading ? 'Loading...' : 'Submit'}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      {hasFetched && (
        <div className='card'>
          <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
            <h5 className='card-title'>Result</h5>
            <Button
              variant='success'
              onClick={handleDownload}
              className='ms-auto'
              disabled={!ledgerRows.length || downloading}
            >
              {downloading ? 'Downloading...' : 'Download as CSV file'}
            </Button>
          </div>
          <div className='card-body'>
            <div className='bg_succes_table_head rounded_table'>
              <Table
                rowKey={(record, index) =>
                  `${record.reference_number || 'row'}-${record.product_id || 'p'}-${index}`
                }
                dataSource={ledgerRows}
                columns={columns}
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 15, 25, 50],
                  showTotal: (totalCount, range) =>
                    `${range[0]}-${range[1]} of ${totalCount} entries`,
                  onChange: handlePageChange,
                  onShowSizeChange: handlePageChange,
                }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesLedger
