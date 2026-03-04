import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Form from 'react-bootstrap/Form'
import { Container, Row, Col, Button, Table } from 'react-bootstrap'
import Select from 'react-select'
import { UserAuth } from '../auth/Auth'
import { PrivateAxios } from '../../environment/AxiosInstance'

function PurchaseLedger () {
  const [vendorId, setVendor] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [ledgerData, setLedgerData] = useState([])
  const [loading, setLoading] = useState(false)

  const { vendor, userDetails } = UserAuth()

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

      const res = await PrivateAxios.post('/purchase/purchaseLedger', {
        vendor_id: vendorId ? vendorId.id : null,
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
      'Vendor',
      'Reference No',
      'Bill No',
      'Product',
      'Received Date',
      'Product ID',
      'Ordered',
      'Received',
      'Remaining Before',
      'Remaining After'
    ].join('\t')

    const rows = ledgerData.map(item =>
      [
        item.vendor_name || '',
        item.reference_number || '',
        item.bill_number || '',
        (item.product_name || '').replace(/\t|\n/g, ' '), // Remove tabs/newlines
        item.recv_date || '',
        item.product_id || '',
        item.ordered || '',
        item.received || '',
        item.remaining_before || '',
        item.remaining_after || ''
      ].join('\t')
    )

    const content = [header, ...rows].join('\n')

    const blob = new Blob([content], {
      type: 'application/vnd.ms-excel;charset=utf-8' // Make it openable in Excel
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'purchase_ledger.xls'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='p-4'>
      <h4>Purchase Ledger</h4>
      <div className='card'>
        <div className='card-body'>
          <Form onSubmit={handleSubmit}>
            <Row className=''>
              <Col lg={4} md={6}>
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
                      onChange={selectedOption => setVendor(selectedOption)}
                      placeholder='Select Vendor'
                      isClearable
                    />
                  </div>
                </div>
              </Col>

              <Col lg={4} md={6}>
                <div className='form-group' id='startDate'>
                  <Form.Label>Start Date</Form.Label>
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
              </Col>

              <Col lg={4} md={6}>
                <div className='form-group' id='endDate'>
                  <Form.Label>End Date</Form.Label>
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
              </Col>

              <Col
                md={12}
                className='d-flex align-items-end justify-content-end'
              >
                <Button type='submit' variant='primary' disabled={loading}>
                  {loading ? 'Loading...' : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {ledgerData.length > 0 && (
        <div className='card'>
          <div className='card-header d-flex justify-content-between align-items-center flex-wrap gap-2'>
            <h5 className='card-title'>Result</h5>
            <Button variant='success' onClick={handleDownload} className='ms-auto'>
              Download as Text File
            </Button>
          </div>
          <div className='card-body p-0'>
            <div className='table-responsive mb-0'>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Reference No</th>
                    <th>Bill No</th>
                    <th>Product</th>
                    <th>Received Date</th>
                    <th>Product ID</th>
                    <th>Ordered</th>
                    <th>Received</th>
                    <th>Remaining Before</th>
                    <th>Remaining After</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.map((item, index) => (
                    <tr key={index}>
                      <td><div className='min-width-200'>{item.vendor_name}</div></td>
                      <td><div className='min-width-100'>{item.reference_number}</div></td>
                      <td><div className='min-width-150'>{item.bill_number}</div></td>
                      <td><div className='min-width-150'>{item.product_name}</div></td>
                      <td><div className='min-width-150'>{item.recv_date}</div></td>
                      <td><div className='min-width-100'>{item.product_id}</div></td>
                      <td><div className='min-width-100'>{item.ordered}</div></td>
                      <td><div className='min-width-100'>{item.received}</div></td>
                      <td><div className='min-width-100'>{item.remaining_before}</div></td>
                      <td><div className='min-width-100'>{item.remaining_after}</div></td>
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

export default PurchaseLedger
