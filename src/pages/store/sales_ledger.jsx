import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col, Button, Table } from 'react-bootstrap'
import Select from 'react-select'
import { UserAuth } from '../auth/Auth'
import { PrivateAxios } from '../../environment/AxiosInstance'

function SalesLedger () {
  const [vendorId, setVendor] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [ledgerData, setLedgerData] = useState([])
  const [loading, setLoading] = useState(false)

  const { getCustomer, userDetails } = UserAuth()

  const handleSubmit = async e => {
    e.preventDefault()
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
        endDate: formattedEndDate
      })

      setLedgerData(res.data)
    } catch (error) {
      console.error('Error fetching ledger:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!ledgerData.length) return

    const header = [
      'Customer Name',
      'Reference No',
      'Invoice No',
      'Invoice Date',
      'Product',
      'Product ID',
      'Qty',
      'Amount',
      'Production Number',
      'Dispatched Status'
    ]

    const escapeCSV = value => {
      if (value === null || value === undefined) return ''
      const str = String(value).replace(/"/g, '""') // escape double quotes
      return `"${str}"` // wrap in quotes to handle commas and newlines
    }

    const rows = ledgerData.map(item =>
      [
        escapeCSV(item.customer_name || item.vendor_name),
        escapeCSV(item.reference_number),
        escapeCSV(item.invoice_number),
        escapeCSV(item.invoice_date),
        escapeCSV(item.product_name),
        escapeCSV(item.product_id),
        escapeCSV(item.qty),
        escapeCSV(item.taxIncl || item.amount),
        escapeCSV(item.production_number),
        escapeCSV(item.is_dispatched == 1 ? 'Yes' : 'No')
      ].join(',')
    )

    const content = [header.join(','), ...rows].join('\n')

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'sales_ledger.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
                    <Select
                      name='vendor_name'
                      options={getCustomer}
                      getOptionLabel={option => option.name}
                      getOptionValue={option => option.id}
                      theme={theme => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary25: '#ddddff',
                          primary: '#6161ff'
                        }
                      })}
                      onChange={selected => setVendor(selected)}
                      isClearable
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
                      onChange={date => setStartDate(date)}
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
                      className='form-control'
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      placeholderText='End Date'
                      dateFormat='yyyy-MM-dd'
                      maxDate={new Date()}
                    />
                  </div>
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

      {ledgerData.length > 0 && (
        <div className='card'>
          <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
            <h5 className='card-title'>Result</h5>
            <Button
              variant='success'
              onClick={handleDownload}
              className='ms-auto'
            >
              Download as Text File
            </Button>
          </div>
          <div className='card-body p-0'>
            <div className='table-responsive mb-0'>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Reference No</th>
                    <th>Invoice No</th>
                    <th>Invoice Date</th>
                    <th>Product</th>

                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Production Number</th>
                    <th>Dispatched Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.map((item, index) => (
                    <tr key={index}>
                      <td><div className='min-width-200'>{item.customer_name}</div></td>
                      <td><div className='min-width-100'>{item.reference_number}</div></td>
                      <td><div className='min-width-100'>{item.invoice_number}</div></td>
                      <td><div className='min-width-100'>{item.invoice_date}</div></td>
                      <td><div className='min-width-100'>{item.product_name}</div></td>

                      <td><div className='min-width-100'>{item.qty}</div></td>
                      <td><div className='min-width-100'>{item.taxIncl}</div></td>
                      <td><div className='min-width-100'>{item.production_number}</div></td>
                      <td><div className='min-width-100'>{item.is_dispatched == 1 ? 'Yes' : 'No'}</div></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesLedger
