import React, { useEffect, useState } from "react";
import $ from "jquery";
import "jquery-ui/ui/widgets/sortable";
import { Modal } from "react-bootstrap";
import { Tooltip } from "antd";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { PrivateAxios } from "../../../environment/AxiosInstance";
import { SuccessMessage } from "../../../environment/ToastMessage";
import { useLocation } from "react-router-dom";

const SelectRoutingModal = ({ show, handleClose, routes,GetSequenceProductComment }) => {


    const [AllRoute, setAllRoute] = useState([])
    useEffect(() => {
        setAllRoute(routes)
    }, [routes])

    const [items, setItems] = useState([]);
    // const GetSequenceProduct = () => {
    //     PrivateAxios.get("production/get-sequence-production-route")
    //         .then((res) => {
    //             setItems(res.data.data)
    //             // setAllRoute(prevent => prevent.filter(item => !res.data.data.includes(item.id)))
                
    //         }).catch((err) => {
    //         }).catch((err) => {

    //         })
    // }
    // useEffect(() => {
    //     GetSequenceProduct()
    // }, [])
    //         })
    // }
    // useEffect(() => {
    //     GetSequenceProduct()
    // }, [])



    const [activeRoute, setActiveRoute] = useState(null); // Track the active route for toggling dropdown visibility
    const [showNewRoute, setShowNewRoute] = useState(false); // Track whether the new route dropdown is visible

    useEffect(() => {
        if (show) {
            // Initialize sortable with a handle selector
            $("#sortable").sortable({
                handle: ".sortable_route_items_drag", // Enables sorting only when dragging this element
                stop: function () {
                    const newOrder = $("#sortable")
                        .children()
                        .toArray()
                        .map((el) => parseInt($(el).data("id"), 10));
                    setItems((prevItems) =>
                        newOrder.map((id) => prevItems.find((item) => item.id === id))
                    );
                },
            });
        }

        return () => {
            // Clean up to avoid issues
            if ($("#sortable").data("ui-sortable")) {
                $("#sortable").sortable("destroy");
            }
        };
    }, [show]);

    const sortableRouteName = routes.length > 0 ? routes.map(item => item?.route_name) : [];

    const handleReSelectRouteClick = (id) => {
        setActiveRoute((prev) => (prev === id ? null : id)); // Toggle visibility for the clicked route
    };

    const handleDropdownChange = (e, item) => {
        setItems((prevItems) =>
            prevItems.map((prevItem) =>
                prevItem.id === item.id
                    ? { ...prevItem, name: e.target.value } // Update the selected name
                    : prevItem
            )
        );
        setActiveRoute(null); // Hide dropdown after selection
    };

    const handleAddMoreRouting = () => {
        //setShowNewRoute((prev) => !prev); // Toggle visibility of the new route input
        setShowNewRoute(true); // Always set to true, disabling the toggle functionality
    };

    const handleNewRouteChange = (e) => {
        const newRoute = e.target.value;
        setAllRoute(prevent => prevent.filter(item => item.id != newRoute.id))
        setItems((prevItems) => [...prevItems, newRoute]);
        setShowNewRoute(false);
    };

    const removeItem = (e) => {
        setItems(prevent => prevent.filter(item => item.id != e))
    }

    const SubmitSequence = () => {
        console.log(items);

        PrivateAxios.post("production/sequence-production-route", { item: items.length > 0 ? JSON.stringify(items) : "" })
            .then((res) => {
                SuccessMessage(res.data.message);
                GetSequenceProductComment()
                handleClose()
            }).catch((err) => {

            })
    }

    return (
        <Modal
            id="SelectRoutingModal"
            show={show}
            onHide={handleClose}
            backdrop="static"
            centered
            size="md"
        >
            <Modal.Header closeButton>
                <Modal.Title className="gth-modal-title">Select Routing</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ul id="sortable" className="route_select_List">
                    {items.map((item, index) => (
                        <li key={item.id} data-id={item.id}>
                            <div className="sortable_route_items">
                                <div className="sortable_route_items_drag cursor-grab">
                                    <i className="fas fa-grip-vertical text-primary"></i>
                                </div>
                                <div className="sortable_route_items_number">
                                    {index + 1}
                                </div>
                                <div className="sortable_route_items_name">
                                    {activeRoute !== item.id ? (
                                        <div className="router_name">{item.route_id} : {item.route_name}</div>
                                    ) : (
                                        <div className="router_select_dropdown">
                                            <DropDownList
                                                data={routes}
                                                value={item.route_name}
                                                onChange={(e) => handleDropdownChange(e, item)}
                                                className="custom_keno_dropdown"
                                                defaultValue={"Select"}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="sortable_route_items_action">
                                    {/* <Tooltip title="Re-Select Route">
                                        <button
                                            className="link-btn"
                                            onClick={() => handleReSelectRouteClick(item.id)}
                                        >
                                            <i className="fas fa-undo text-muted"></i>
                                        </button>
                                    </Tooltip> */}
                                    <Tooltip title="Remove">
                                        <button type='button' onClick={() => removeItem(item.id)} className="link-btn">
                                            <i className="fas fa-minus-circle text-danger"></i>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </li>
                    ))}
                    {showNewRoute && (
                        <li>
                            <div className="sortable_route_items">
                                <div className="sortable_route_items_drag cursor-grab">
                                    <i className="fas fa-grip-vertical text-primary"></i>
                                </div>
                                <div className="sortable_route_items_number">
                                    {items.length + 1}
                                </div>
                                <div className="sortable_route_items_name">
                                    <DropDownList
                                        data={AllRoute}
                                        dataItemKey="id"
                                        textField="route_name"
                                        onChange={handleNewRouteChange}
                                        className="custom_keno_dropdown"
                                        defaultValue={"Select"}
                                    />
                                </div>
                                <div className="sortable_route_items_action">
                                    <Tooltip title="Remove">
                                        <button
                                            className="link-btn"
                                            onClick={() => setShowNewRoute(false)}
                                        >
                                            <i className="fas fa-minus-circle text-danger"></i>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
                <div className="d-flex justify-content-start mt-4">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleAddMoreRouting}
                    >
                        <i className="fas fa-plus me-2"></i>
                        Add More Routing
                    </button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button type='button' className="btn btn-exp-green" onClick={SubmitSequence}>
                    Select <span className="mx-2">{items.length}</span> Routing
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default SelectRoutingModal;
