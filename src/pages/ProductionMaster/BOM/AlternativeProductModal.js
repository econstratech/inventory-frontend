import { Modal } from 'react-bootstrap';
import React from 'react';

const AlternativeProductModal = ({ show, alternatives, onClose  }) => {
  
  return (
    <>
      <Modal
        id="BomAddAlternateItemModal"
        show={show} onHide={onClose}
        backdrop="static"
        centered
        size=""
        className='fullscreen'
      >
        <Modal.Header closeButton>
          <Modal.Title className="gth-modal-title">View Alternate Items</Modal.Title>
        </Modal.Header>
        <Modal.Body className='pb-1'>
          <div className="table-responsive fixed-table-wrapper">
            <table className="table table-bordered primary-table-head fixedTable-head">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Item Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
              {alternatives.length > 0 ? (
                        alternatives.map((alt, index) => (
                            <tr key={index}>
                              <td>{index +1}</td>
                                <td>{alt.product_code}</td>
                                <td>{alt.name}</td>
                                <td>{alt.category}</td>
                                <td>{alt.quantity}</td>
                                <td>{alt.unit}</td>
                                <td>{alt.comment || '-'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">No Alternative Products Available</td>
                        </tr>
                    )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AlternativeProductModal;
