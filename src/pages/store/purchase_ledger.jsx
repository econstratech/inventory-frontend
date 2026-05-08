import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs'
import Form from 'react-bootstrap/Form'
import { Button } from 'react-bootstrap'
import { Table } from 'antd'
import Select from 'react-select'

import { UserAuth } from '../auth/Auth'
import { PrivateAxios } from '../../environment/AxiosInstance'
import { ErrorMessage } from '../../environment/ToastMessage'

const DEFAULT_PAGE_SIZE = 15

function PurchaseLedger () {
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

  const { vendor } = UserAuth()

  const fetchLedger = async (page, limit) => {
    setLoading(true)
    try {
      const formattedStartDate = startDate
        ? startDate.toISOString().slice(0, 10)
        : null
      const formattedEndDate = endDate
        ? endDate.toISOString().slice(0, 10)
        : null

      const res = await PrivateAxios.post('/purchase/purchaseLedger', {
        vendor_id: vendorId?.id || null,
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
      ErrorMessage('Failed to fetch purchase ledger')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()

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

    fetchLedger(1, pageSize)
  }

  const handlePageChange = (page, size) => {
    fetchLedger(page, size)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const payload = {}
      if (vendorId?.id) payload.vendor_id = vendorId.id
      if (startDate && endDate) {
        payload.startDate = startDate.toISOString().slice(0, 10)
        payload.endDate = endDate.toISOString().slice(0, 10)
      }

      const response = await PrivateAxios.post(
        '/purchase/purchaseLedger/export',
        payload,
        { responseType: 'blob' }
      )

      const disposition = response.headers['content-disposition']
      let filename = 'purchase_ledger.csv'
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
      ErrorMessage('Failed to export purchase ledger')
    } finally {
      setDownloading(false)
    }
  }

  const columns = [
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      render: value => <div className='min-width-200'>{value}</div>,
    },
    {
      title: 'PO Reference No',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: value => <div className='min-width-150'>{value}</div>,
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: value => (
        <div className='min-width-120'>
          {value ? dayjs(value).format('DD/MM/YYYY') : 'N/A'}
        </div>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, item) => {
        const variant = item.weight_per_unit
          ? `${item.weight_per_unit} ${item.uom_label || ''}`.trim()
          : ''
        return (
          <div className='min-width-200'>
            {variant
              ? `${item.product_name || ''} (${variant})`
              : item.product_name || ''}
          </div>
        )
      },
    },
    {
      title: 'Order Qty',
      dataIndex: 'order_quantity',
      key: 'order_quantity',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Received Qty',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Returned Qty',
      dataIndex: 'returned_quantity',
      key: 'returned_quantity',
      render: value => <div className='min-width-100'>{value}</div>,
    },
    {
      title: 'Balance Qty',
      key: 'balance_qty',
      render: (_, item) => (
        <div className='min-width-100'>
          {Number(item.order_quantity || 0) - Number(item.received_quantity || 0)}
        </div>
      ),
    },
  ]

  return (
    <div className='p-4'>
      <h4>Purchase Ledger</h4>
      <div className='card'>
        <div className='card-body'>
          <Form onSubmit={handleSubmit}>
            <div className='row'>
              <div className='col-lg-4 col-md-6'>
                <div className='form-group' id='vendorSelect'>
                  <Form.Label>Vendor</Form.Label>
                  <div className='custom-select-wrap'>
                    <Select
                      name='vendor_name'
                      options={vendor}
                      getOptionLabel={option => option.vendor_name}
                      getOptionValue={option => option.id}
                      theme={theme => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: '#ddddff',
                          primary: '#6161ff'
                        }
                      })}
                      value={vendorId}
                      onChange={selectedOption => setVendor(selectedOption)}
                      placeholder='Select Vendor'
                      isClearable
                    />
                  </div>
                </div>
              </div>

              <div className='col-lg-4 col-md-6'>
                <div className='form-group' id='startDate'>
                  <Form.Label>Start Date</Form.Label>
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
                  <Form.Label>End Date</Form.Label>
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
                  record.purchase_product_id ?? `row-${index}`
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

export default PurchaseLedger
