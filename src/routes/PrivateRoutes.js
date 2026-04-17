import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserAuth } from "../pages/auth/Auth";
import Loader from "../pages/landing/loder/Loader";
// import Management from "../pages/managment/Management.js";
// import FinalApprovalPending from "../pages/managment/approveQuotation/Active.js";
import ReceiptVoucherNote from "../pages/Payments/Documents/ViewDocuments/ReceiptVoucher/ReceiptVoucherNote.js";
import PurchaseReturnChallanNote from "../pages/Payments/Documents/ViewDocuments/PurchaseReturnChallan/PurchaseReturnChallanNote.js";
import ReportsIndex from "../pages/Reports/ReportsIndex.js";


import Pos from "../pages/Pos/Pos.js";
import ViewDetails from "../pages/Pos/ViewDetails.js";
import OrderStatus from "../pages/Pos/OrderStatus.js";
import SalesData from "../pages/Pos/SalesData.js";
import CompanyCreation from "../pages/Pos/CompanyCreation.js";
// import PosThankYouPage from "../pages/Pos/PosThankYouPage.js";
const CompanyManagement = React.lazy(() => import("../pages/settings/CompanyManagement.js"));


const Active = React.lazy(() => import("../pages/managment/approveQuotation/Active.js"));
const RequestForQuotation = React.lazy(() => import("../pages/managment/approveQuotation/RequestForQuotation.js"));
const SendToManagement = React.lazy(() => import("../pages/managment/approveQuotation/SendToManagement.js"));
const SalesOrder = React.lazy(() => import("../pages/managment/approveQuotation/SalesOrder.js"));
const RejectedFromAdmin = React.lazy(() => import("../pages/managment/approveQuotation/RejectedFromAdmin.js"));
const FullyBilled = React.lazy(() => import("../pages/managment/approveQuotation/FullyBilled.js"));
const Done = React.lazy(() => import("../pages/managment/approveQuotation/Done.js"));
const NothingToBill = React.lazy(() => import("../pages/managment/approveQuotation/NothingToBill.js"));
const ItemsReceivedDone = React.lazy(() => import("../pages/managment/approveQuotation/ItemsReceivedDone.js"));
const ApproveActive = React.lazy(() => import("../pages/managment/approvePO/ApproveActive.js"));
const CrateFinalPending = React.lazy(() => import("../pages/operations/createRFQ/CrateFinalPending.js"));
const ApprovedFromAdmin = React.lazy(() => import("../pages/operations/createRFQ/ApprovedFromAdmin.js"));
const CrateFullyBilled = React.lazy(() => import("../pages/operations/createRFQ/CrateFullyBilled.js"));
const CrateRequestQuotation = React.lazy(() => import("../pages/operations/createRFQ/CrateRequestQuotation.js"));
const CrateManagement = React.lazy(() => import("../pages/operations/createRFQ/CrateManagement.js"));
const PurchaseSalesOrder = React.lazy(() => import("../pages/operations/purchaseOrders/PurchaseSalesOrder.js"));
const PurchaseDone = React.lazy(() => import("../pages/operations/purchaseOrders/PurchaseDone.js"));
const PurchaseNothingBill = React.lazy(() => import("../pages/operations/purchaseOrders/PurchaseNothingBill.js"));
const CompletedOrdersNothingsBill = React.lazy(() => import("../pages/operations/completedOrder/CompletedOrdersNothingsBill.js"));
// const RejectedOrdersStatusBar = React.lazy(() => import("../pages/operations/rejectedOrder/RejectedOrdersStatusBar.js"));
const RejectedOrders = React.lazy(() => import("../pages/operations/rejectedOrder/RejectedOrders.js"));
const MypurchaseNothingToBill = React.lazy(() => import("../pages/bill/MypurchaseNothingToBill.js"));
const PendingApprovalSales = React.lazy(() => import("../pages/sales/managment/PendingApprovalSales.js"));
const MysalesReceivedProduct = React.lazy(() => import("../pages/sales/quotation/poUpdate/MysalesReceivedProduct.js"));


// const LandingMain = React.lazy(() => import('../LandingMain'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const AuthenticateUser = React.lazy(() => import('../pages/auth/AuthenticateUser'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ProtectedRoute = React.lazy(() => import("./ProtectedRoute"));
const PurchaseDashboard = React.lazy(() => import("../pages/purchase/Dashboard"));
const SalesDashboard = React.lazy(() => import("../pages/SalesDashboard"));

//settings
const OfficeTiming = React.lazy(() => import("../pages/settings/OfficeTiming"));
const Department = React.lazy(() => import("../pages/settings/Department"));
const NotificationSetting = React.lazy(() => import("../pages/settings/NotificationSetting"));
const WhatsappSetting = React.lazy(() => import("../pages/settings/WhatsappSetting"));
const CompanyInfo = React.lazy(() => import("../pages/settings/CompanyInfo"));
const WarehousesPermission = React.lazy(() => import("../pages/settings/settingsInventory/WarehousesPermission.js"));
const BarcodePermission = React.lazy(() => import("../pages/settings/BarcodePermission"));
const UomPermission = React.lazy(() => import("../pages/settings/UomPermission"));
const DocumentSetting = React.lazy(() => import("../pages/settings/DocumentSetting"));
const DefaultDocumentStore = React.lazy(() => import("../pages/settings/DefaultDocumentStore"));
const DefaultApproval = React.lazy(() => import("../pages/settings/DefaultApproval"));
const Brands = React.lazy(() => import("../pages/settings/Brands"));
const EwayBill = React.lazy(() => import("../pages/settings/gstApi/EwayBill.js"));
//product
const MyproductList = React.lazy(() => import("../pages/product/AllProducts"));
const MycategoryList = React.lazy(() => import("../pages/product/AllCategories"));
const AddNewcategory = React.lazy(() => import("../pages/product/AddNewcategory"));
const AddNewProduct = React.lazy(() => import("../pages/product/AddNewProduct"));
const EditProduct = React.lazy(() => import("../pages/product/EditProduct"));
//purchase
const MypurchaseList = React.lazy(() => import("../pages/operations/createRFQ/MypurchaseList.js"));
const MypurchaseListRejected = React.lazy(() => import("../pages/rfq/MypurchaseListRejected"));
const MyNewpurchase = React.lazy(() => import("../pages/rfq/MyNewpurchase"));
const EditMyPurchase = React.lazy(() => import("../pages/rfq/EditMyPurchase"));
const MypurchaseOrderList = React.lazy(() => import("../pages/operations/purchaseOrders/MypurchaseOrderList.js"));
const MypurchaseOrderListDone = React.lazy(() => import("../pages/operations/completedOrder/MypurchaseOrderListDone.js"));
const MypurchaseOrderListafterrecv = React.lazy(() => import("../pages/bill/MypurchaseOrderListafterrecv.js"));

const PurchaseOrderBill = React.lazy(() => import("../pages/rfq/PurchaseOrderBill"));
const PurchaseOrderRecv = React.lazy(() => import("../pages/rfq/PurchaseOrderRecv"));
const OrderConfirm = React.lazy(() => import("../pages/rfq/PurchaseOrderConfirm"));
const ConfirmedBill = React.lazy(() => import("../pages/rfq/ConfirmedBill"));

//user
// const UsersList = React.lazy(() => import("../pages/user/UsersList"));
const MyNewpurchaseOrder = React.lazy(() => import("../pages/rfq/MyNewpurchaseOrder"));
const MyNewpurchaseOrderAdvance = React.lazy(() => import("../pages/rfq/MyNewpurchaseOrderAdvance"));
const EditProductMyPurchaseOrder = React.lazy(() => import("../pages/rfq/EditProductMyPurchaseOrder"));
const PendingApproval = React.lazy(() => import("../pages/managment/approveQuotation/PendingApproval.js"));
const FinalApproval = React.lazy(() => import("../pages/managment/approvePO/FinalApproval.js"));
const UserList = React.lazy(() => import("../pages/settings/user/UsersList.js"));
//vendor
const MyVendorList = React.lazy(() => import("../pages/vendor/AllVendors"));
const AddNewVendor = React.lazy(() => import("../pages/vendor/AddNewVendor"));
const EditVendor = React.lazy(() => import("../pages/vendor/EditVendor"));
const FollowupOrder = React.lazy(() => import("../pages/follow/FollowupOrder"));
const RecvUpdate = React.lazy(() => import("../pages/store/RecvUpdate.js"));
const PurchaseLedger = React.lazy(() => import("../pages/store/purchase_ledger.jsx"));
const SalesLedger = React.lazy(() => import("../pages/store/sales_ledger.jsx"));
//sales module customers
const MyCustomersList = React.lazy(() => import("../pages/customer/AllCustomers"));
const AddNewCustomer = React.lazy(() => import("../pages/customer/AddNewCustomer"));
const EditCustomer = React.lazy(() => import("../pages/customer/EditCustomer"));

const MySalesList = React.lazy(() => import("../pages/sales/quotation/MysalesList"));
const SalesQuotationRejected = React.lazy(() => import("../pages/sales/quotation/SalesQuotationRejected.js"));
const SalesQuotation = React.lazy(() => import("../pages/sales/quotation/SalesQuotation.js"));
const MysalesListRejected = React.lazy(() => import("../pages/sales/quotation/MysalesListRejected"));
const MyNewsale = React.lazy(() => import("../pages/sales/quotation/MyNewsale"));
const EditMySales = React.lazy(() => import("../pages/sales/quotation/EditMySales"));
const RevisedMySales = React.lazy(() => import("../pages/sales/quotation/RevisedMySales"));

const CompletedSalesOrdersList = React.lazy(() => import("../pages/sales/quotation/salesOrders/CompletedSalesOrdersList.js"));
const MysalesOrderListDone = React.lazy(() => import("../pages/sales/quotation/poUpdate/MysalesOrderListDone.js"));
const MysalesOrderDispatchList = React.lazy(() => import("../pages/sales/quotation/dispatch/MysalesOrderDispatchList.js"));
const MysalesOrderDispatchListDone = React.lazy(() => import("../pages/sales/quotation/dispatch/MysalesOrderDispatchListDone.js"));
// const PendingApprovalSales = React.lazy(() => import("../pages/sales/managment/PendingApproval"));
const Followupsales = React.lazy(() => import("../pages/sales/follow/FollowupOrder"));
const Modulesdata = React.lazy(() => import("../pages/settings/Modulesdata"));
const RoleData = React.lazy(() => import("../pages/settings/RoleData"));
const RolePermission = React.lazy(() => import("../pages/settings/RolePermission.js"));
const EinvoiceApiAccount = React.lazy(() => import("../pages/settings/EinvoiceApiAccount.js"));
const GatewaySettings = React.lazy(() => import("../pages/settings/GatewaySettings.js"));
const ProductAttributes = React.lazy(() => import("../pages/settings/ProductAttributes.js"));
const ManageProductionFlow = React.lazy(() => import("../pages/settings/ManageProductionFlow.js"));

//Inventory
const InventoryMaster = React.lazy(() => import("../pages/InventoryMaster/InventoryMaster.js"));
const InventoryMasterEdit = React.lazy(() => import("../pages/InventoryMaster/InventoryMasterEdit.js"));
const InventoryMasterEditItemDetails = React.lazy(() => import("../pages/InventoryMaster/InventoryMasterEditItemDetails.js"));
const InventoryMasterEditItemHistory = React.lazy(() => import("../pages/InventoryMaster/InventoryMasterEditItemHistory.js"));
const InventoryMasterAdjustment = React.lazy(() => import("../pages/InventoryMaster/InventoryMasterAdjustment.js"));
const InventoryMasterBarcode = React.lazy(() => import("../pages/InventoryMaster/InventoryMasterBarcode.js"));
const InventoryStockMovement = React.lazy(() => import("../pages/InventoryMaster/StockMovement.js"));
const StockBarcode = React.lazy(() => import("../pages/InventoryMaster/StockBarcode.js"));
const InventoryApproval = React.lazy(() => import("../pages/InventoryMaster/inventoryApproval.js"));
const InventoryDashboard = React.lazy(() => import("../pages/InventoryMaster/InventoryDashboard"));
const InventoryFloorMaster = React.lazy(() => import("../pages/InventoryMaster/FloorManagment.js"));
const StockMaster = React.lazy(() => import("../pages/StockMaster/StockMaster.js"));
const AddToStockMaster = React.lazy(() => import("../pages/StockMaster/AddToStockMaster.js"));
const BomMaster = React.lazy(() => import("../pages/ProductionMaster/BOM/BomMaster.js"));
const CreateBomMaster = React.lazy(() => import("../pages/ProductionMaster/BOM/CreateBomMaster.js"));
const BomReport = React.lazy(() => import("../pages/ProductionMaster/BOM/BomReport.js"));
;
// production
const BomList = React.lazy(() => import("../pages/ProductionMaster/BOM/BomList.js"));
const BomDraftList = React.lazy(() => import("../pages/ProductionMaster/BOM/BomDraftList.js"));
const BomPublishedList = React.lazy(() => import("../pages/ProductionMaster/BOM/BomPublishedList.js"));
const BomDeleteList = React.lazy(() => import("../pages/ProductionMaster/BOM/BomDeleteList.js"));
const CreateBom = React.lazy(() => import("../pages/ProductionMaster/BOM/CreateBom.js"));
const ViewBom = React.lazy(() => import("../pages/ProductionMaster/BOM/ViewBom.js"));
const EditBom = React.lazy(() => import("../pages/ProductionMaster/BOM/EditBom.js"));
// const AllProductionProcess = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess"));
const AllProductionProcessList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessList"));
const AllProductionProcessApprovePendingList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessApprovePendingList.js"));
const AllProductionProcessApproveList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessApproveList.js"));
const AllProductionProcessTestPendingList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessTestPendingList.js"));
const AllProductionProcessCanceledList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessCanceledList.js"));
const AllProductionProcessRepairPendingList = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/AllProductionProcessRepairPendingList.js"));
const CreateProduction = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/CreateProduction"));
const ViewProductionProcess = React.lazy(() => import("../pages/ProductionMaster/AllProductionProcess/ViewProductionProcess.js"));
const WorkOrders = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrders.js"));
const WorkOrdersOpen = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrdersOpen.js"));
const WorkOrdersPlanned = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrdersPlanned.js"));
const WorkOrdersPending = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrdersPending.js"));
const WorkOrdersWip = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrdersWip.js"));
const WorkOrdersCompleted = React.lazy(() => import("../pages/ProductionMaster/workOrders/WorkOrdersCompleted.js"));
const ProductionDispatch   = React.lazy(() => import("../pages/ProductionMaster/dispatch/ProductionDispatch.js"));
const ProductionDashboard  = React.lazy(() => import("../pages/ProductionMaster/dashboard/ProductionDashboard.js"));

const SubContract = React.lazy(() => import("../pages/ProductionMaster/subContract/SubContract.js"));
const SubContractApprovePending = React.lazy(() => import("../pages/ProductionMaster/subContract/SubContractApprovePending.js"));
const SubContractApprove = React.lazy(() => import("../pages/ProductionMaster/subContract/SubContractApprove.js"));
const SubContractCanceled = React.lazy(() => import("../pages/ProductionMaster/subContract/SubContractCanceled.js"));


const DocumentReceivable = React.lazy(() => import("../pages/Payments/Documents/DocumentReceivable.js"));
const DocumentPayable = React.lazy(() => import("../pages/Payments/Documents/DocumentPayable.js"));
const DocumentReceive = React.lazy(() => import("../pages/Payments/Documents/DocumentReceive.js"));
const DocumentPaid = React.lazy(() => import("../pages/Payments/Documents/DocumentPaid.js"));
const DocumentOverdueReceivable = React.lazy(() => import("../pages/Payments/Documents/DocumentOverdueReceivable.js"));
const DocumentOverduePayable = React.lazy(() => import("../pages/Payments/Documents/DocumentOverduePayable.js"));
const TaxInvoice = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/TaxInvoice.js"));
const OpeningBalance = React.lazy(() => import("../pages/Payments/OpeningBalance/OpeningBalance.js"));
const CreditNote = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/CN/CreditNote.js"));
const DebitNote = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/DebitNote/DebitNote.js"));
const TransactionDetails = React.lazy(() => import("../pages/Payments/Transaction/TransactionDetails.js"));
const PurchaseOrderInvoice = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/PurchaseOrder.js"));
const InwardDocumentInvoice = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/InwardDocument.js"));
const GoodsReceiptNote = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/GRN/GoodsReceiptNote.js"));
const InwardDocumentNote = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/InwardDocument/InwardDocumentNote.js"));
const TaxInvoiceDocument = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/TaxInvoice/TaxInvoiceDocument.js"));
const ProformaInvoiceNote = React.lazy(() => import("../pages/Payments/Documents/ViewDocuments/ProformaInvoice/ProformaInvoiceNote.js"));

const PaymentLogDetails = React.lazy(() => import("../pages/Payments/PaymentLogDetails/PaymentLogDetails.js"));
const CompanyLedgerAll = React.lazy(() => import("../pages/Payments/CompanyLedger/CompanyLedgerAll.js"));
const PaymentReceiptReceived = React.lazy(() => import("../pages/Payments/Receipts/PaymentReceiptReceived.js"));
const PaymentPaymentsPaid = React.lazy(() => import("../pages/Payments/Payments/PaymentPaymentsPaid.js"));
// Reports 
const StockLedgerReport = React.lazy(() => import("../pages/Reports/InventoryMasterReports/StockLedgerReport/StockLedgerReport.js"));
const ReportGenerator = React.lazy(() => import("../pages/Reports/InventoryMasterReports/ReportGenerator.js"));
const FifoLifoStockValuation = React.lazy(() => import("../pages/Reports/InventoryMasterReports/FifoLifoStockValuation/FifoLifoStockValuation.js"));
const InventoryValuationSummary = React.lazy(() => import("../pages/Reports/InventoryMasterReports/InventoryValuationSummary/InventoryValuationSummary.js"));
const ReorderLevelReport = React.lazy(() => import("../pages/Reports/InventoryMasterReports/ReorderLevelReport/ReorderLevelReport.js"));
const AgingReport = React.lazy(() => import("../pages/Reports/InventoryMasterReports/AgingReport/AgingReport.js"));
const BinCardItemMovementReport = React.lazy(() => import("../pages/Reports/InventoryMasterReports/BinCardItemMovementReport/BinCardItemMovementReport.js"));
const PurchaseOrderSummary  = React.lazy(() => import( "../pages/Reports/PurchaseReport/PurchaseOrderSummary/PurchaseOrderSummary.js"));
const PurchaseRegister  = React.lazy(() => import( "../pages/Reports/PurchaseReport/PurchaseRegister/PurchaseRegister.js"));
const PendingPOReport  = React.lazy(() => import( "../pages/Reports/PurchaseReport/PendingPOReport/PendingPOReport.js"));
const StockTransferReport = React.lazy(() => import("../pages/Reports/StockTransferReport/StockTransferReport.js"));
const MaterialIssueReport = React.lazy(() => import("../pages/Reports/ProductionReport/MaterialIssueReport.js"));
const VendorPerformanceReport  = React.lazy(() => import( "../pages/Reports/PurchaseReport/VendorPerformanceReport/VendorPerformanceReport.js"));
const PurchaseRateComparison  = React.lazy(() => import( "../pages/Reports/PurchaseReport/PurchaseRateComparison/PurchaseRateComparison.js"));
const PrToPoConversionReport  = React.lazy(() => import( "../pages/Reports/PurchaseReport/PrToPoConversionReport/PrToPoConversionReport.js"));
const MonthWisePurchaseValue  = React.lazy(() => import( "../pages/Reports/PurchaseReport/MonthWisePurchaseValue/MonthWisePurchaseValue.js"));
const ItemWisePurchaseReport  = React.lazy(() => import( "../pages/Reports/PurchaseReport/ItemWisePurchaseReport/ItemWisePurchaseReport.js"));
const SaleRegister  = React.lazy(() => import( "../pages/Reports/SalesReport/SalesRegister/SaleRegister.js"));
const CustomerWiseSalesReport  = React.lazy(() => import( "../pages/Reports/SalesReport/CustomerWiseSalesReport/CustomerWiseSalesReport.js"));
const ItemWiseSalesReport  = React.lazy(() => import( "../pages/Reports/SalesReport/ItemWiseSalesReport/ItemWiseSalesReport.js"));
const ProfitabilityReport  = React.lazy(() => import( "../pages/Reports/SalesReport/ProfitabilityReport/ProfitabilityReport.js"));
const PosThankYouPage  = React.lazy(() => import( "../pages/Pos/PosThankYouPage.js"));
const PosOrder  = React.lazy(() => import( "../pages/Pos/PosOrder.js"));
const TopSellingProductsReport  = React.lazy(() => import( "../pages/Reports/SalesReport/TopSellingProductsReport/TopSellingProductsReport.js"));
const RegionWiseSalesReport  = React.lazy(() => import( "../pages/Reports/SalesReport/RegionWiseSalesReport/RegionWiseSalesReport.js"));
const BackorderReport  = React.lazy(() => import( "../pages/Reports/SalesReport/BackorderReport/BackorderReport.js"));
const SlowMovingItemReport  = React.lazy(() => import( "../pages/Reports/SalesReport/SlowMovingItem/SlowMovingItemReport.js"));
const StockVsSaleAnalysis  = React.lazy(() => import( "../pages/Reports/CrossModuleCombineReports/StockVsSaleAnalysis/StockVsSaleAnalysis.js"));
const PurchaseVsConsumptionReport  = React.lazy(() => import( "../pages/Reports/CrossModuleCombineReports/PurchaseVsConsumptionReport/PurchaseVsConsumptionReport.js"));
const AbcAnalysisReport  = React.lazy(() => import( "../pages/Reports/CrossModuleCombineReports/AbcAnalysis/AbcAnalysisReport.js"));
const DeadStockReport  = React.lazy(() => import( "../pages/Reports/CrossModuleCombineReports/DeadStockReport/DeadStockReport.js"));
const MrpReport  = React.lazy(() => import( "../pages/Reports/CrossModuleCombineReports/MRP/MrpReport.js"));
const PosDashboardIndex  = React.lazy(() => import( "../pages/Pos/PosDashboard/PosDashboardIndex.js"));
const WelcomeScreenIndex  = React.lazy(() => import( "../pages/WelcomeScreen/WelcomeScreenIndex.js"));
const IndentRequirementReport  = React.lazy(() => import( "../pages/Reports/PurchaseReport/IndentRequirementReport.js"));
const BatchExpiryReport  = React.lazy(() => import( "../pages/Reports/BatchExpiryReport.js"));

function PrivateRoutes() {
  const { isLoggedIn } = UserAuth();
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* <Route path="/" element={<LandingMain />} /> */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/welcome" /> : <Login />} />
        <Route path="/authenticate" element={<AuthenticateUser />} />
        <Route path="/reset-password" element={isLoggedIn ? <Navigate to="/welcome" /> : <ForgotPassword />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/welcome" /> : <Register />} />



        <Route element={<ProtectedRoute isLogin={isLoggedIn} />}>
          <Route path="/purchase/dashboard" element={<PurchaseDashboard />} />
          <Route path="/sales-dashboard" element={<SalesDashboard />} />
          {/* product */}
          <Route path="/products" element={<MyproductList />} />
          <Route path="/category" element={<MycategoryList />} />
          <Route path="/add-new-category" element={<AddNewcategory />} />
          <Route path="/add-new-product" element={<AddNewProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          {/* purchase */}
          {/* management */}
          <Route path="/pending-approval/rejected-from-admin" element={<RejectedFromAdmin />} />
          <Route path="/pending-approval/final-approval-pending" element={<PendingApproval />} />
          <Route path="/pending-approval/active" element={<Active />} />
          <Route path="/pending-approval/request-for-quotation" element={<RequestForQuotation />} />
          <Route path="/pending-approval/send-to-management" element={<SendToManagement />} />
          <Route path="/pending-approval/sales-order" element={<SalesOrder />} />
          {/* <Route path="/pending-approval/rejected-from-admin" element={<RejectedFromAdmin />} /> */}
          <Route path="/pending-approval/fully-billed" element={<FullyBilled />} />
          <Route path="/pending-approval/done" element={<Done />} />
          <Route path="/pending-approval/nothing-to-bill" element={<NothingToBill />} />
          <Route path="/pending-approval/items-received-done" element={<ItemsReceivedDone />} />
          {/* <Route path="/pending-approval/rejected-from-admin" element={<PendingApproval />} /> */}
          <Route path="/approve-po/final-approval-pending" element={<FinalApproval />} />
          <Route path="/approve-po/approval-Active" element={<ApproveActive />} />
          <Route path="/settings/user" element={<UserList />} />
          {/* management */}
          {/* operation */}
          <Route path="/operation/create-rfq-active" element={<MypurchaseList />} />
          <Route path="/operation/create-rfq-reviewing" element={<CrateFinalPending />} />
          <Route path="/operation/approved-from-admin" element={<ApprovedFromAdmin />} />

          <Route path="/operation/create-rfq-billed" element={<CrateFullyBilled />} />
          <Route path="/operation/create-rfq-quotation" element={<CrateRequestQuotation />} />
          <Route path="/operation/create-rfq-management" element={<CrateManagement />} />
          <Route path="/operation/purchase-orders/received-done" element={<MypurchaseOrderList />} />
          <Route path="/operation/purchase-orders/sales-orders" element={<PurchaseSalesOrder />} />
          <Route path="/operation/purchase-orders/done" element={<PurchaseDone />} />
          <Route path="/operation/purchase-orders/nothing-to-bill" element={<PurchaseNothingBill />} />
          <Route path="/operation/complete-orders/received-done" element={<MypurchaseOrderListDone />} />
          <Route path="/operation/complete-orders/nothing-to-bill" element={<CompletedOrdersNothingsBill />} />
          <Route path="/operation/rejected-orders/rejected" element={<RejectedOrders />} />
          <Route path="/bill/purchase-orders-recved/items-received-done" element={<MypurchaseOrderListafterrecv />} />
          <Route path="/bill/purchase-orders-recved/nothing-to-bill" element={<MypurchaseNothingToBill />} />


          <Route path="/rejected-purchase" element={<MypurchaseListRejected />} />
          <Route path="/purchase/new" element={<MyNewpurchase />} />
          <Route path="/purchase/:id" element={<EditMyPurchase />} />

          <Route path="/purchase-orders/new" element={<MyNewpurchaseOrder />} />
          <Route path="/purchase-orders/advance/:id" element={<MyNewpurchaseOrderAdvance />} />
          <Route path="/purchase-orders/:id" element={<EditProductMyPurchaseOrder />} />


          <Route path="/purchase-orders/createbill/:id" element={<PurchaseOrderBill />} />
          <Route path="/purchase-orders/recvorder/:id" element={<PurchaseOrderRecv />} />
          <Route path="/bill/confirm-order/:id" element={<OrderConfirm />} />
          <Route path="/confirmedbill/:id" element={<ConfirmedBill />} />
          <Route path="/store/recv_update/request-quotation" element={<RecvUpdate />} />
          <Route path="/operation/purchase_ledger" element={<PurchaseLedger />} />
          <Route path="/operation/sales_ledger" element={<SalesLedger />} />
          <Route path="/followup/order-followup/nothing-bill" element={<FollowupOrder />} />
          {/* Settings */}
          <Route path="/office-timing" element={<OfficeTiming />} />
          <Route path="/department" element={<Department />} />
          <Route path="/notification-setting" element={<NotificationSetting />} />
          <Route path="/whatsapp-setting" element={<WhatsappSetting />} />
          <Route path="/company-info" element={<CompanyInfo />} />
          <Route path="/modules" element={<Modulesdata />} />
          <Route path="/role" element={<RoleData />} />
          <Route path="/permission" element={<RolePermission />} />
          <Route path="/settings/inventory/warehouses" element={<WarehousesPermission />} />
          <Route path="/settings/inventory/barcode" element={<BarcodePermission />} />
          <Route path="/settings/inventory/master-uom" element={<UomPermission />} />
          <Route path="/settings/inventory/entry-into-store" element={<DocumentSetting />} />
          <Route path="/settings/inventory/default_stores" element={<DefaultDocumentStore />} />
          <Route path="/settings/inventory/default-approval" element={<DefaultApproval />} />
          <Route path="/settings/brands" element={<Brands />} />
          <Route path="/settings/gst/eway-bill-api-account" element={<EwayBill />} />
          <Route path="/settings/gst/einvoice-api-account" element={<EinvoiceApiAccount />} />
          <Route path="/settings/pos/gateway" element={<GatewaySettings />} />
          <Route path="/settings/product-attributes" element={<ProductAttributes />} />
          <Route path="/settings/manage-production-flow" element={<ManageProductionFlow />} />

          {/* user list */}
          {/* <Route path="/users" element={<UsersList />} /> */}
          {/* <Route path="/settings/user" element={<UserList />} /> */}
          {/* vendor */}
          <Route path="/suppliers" element={<MyVendorList />} />
          <Route path="/add-new-vendor" element={<AddNewVendor />} />
          <Route path="/edit-vendor/:id" element={<EditVendor />} />
           <Route path="/company-management" element={<CompanyManagement />} />
          {/* Sales Module Routes
          Customer */}
          <Route path="/customers" element={<MyCustomersList />} />
          <Route path="/add-new-customer" element={<AddNewCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />
          <Route path="/sales/followup" element={<Followupsales />} />
          <Route path="/sales/quotation/reviewing" element={<MySalesList />} />
          <Route path="/sales/quotation/rejected" element={<SalesQuotationRejected />} />
          <Route path="/sales/quotation" element={<SalesQuotation />} />
          <Route path="/rejected-sales" element={<MysalesListRejected />} />
          <Route path="/sales/new" element={<MyNewsale />} />
          <Route path="/sales/:id" element={<EditMySales />} />
          <Route path="/sales/revised/:id" element={<RevisedMySales />} />
          <Route path="/completed-sales-orders" element={<CompletedSalesOrdersList />} />
          <Route path="/sales-orders/follow-done" element={<MysalesOrderListDone />} />
          <Route path="/sales-orders/dispatch/order-dispatch" element={<MysalesOrderDispatchList />} />
          <Route path="/sales-orders/dispatch/order-dispatch-done" element={<MysalesOrderDispatchListDone />} />
          <Route path="/sales-orders/received-product" element={<MysalesReceivedProduct />} />
          <Route path="/sales/pending-approval/reviewing" element={<PendingApprovalSales />} />
          <Route path="/inventory/inventory-master" element={<InventoryMaster />} />
          <Route path="/inventory/inventory-master-edit/:id" element={<InventoryMasterEdit />} />
          <Route path="/inventory/inventory-master-edit/:id/item-details" element={<InventoryMasterEditItemDetails />} />
          <Route path="/inventory/inventory-master-edit/:id/item-history" element={<InventoryMasterEditItemHistory />} />
          <Route path="/inventory/inventory-master-adjustment/:refid" element={<InventoryMasterAdjustment />} />
          <Route path="/inventory/view_document_approval/:refid/:id/:chqty/:ntqty" element={<InventoryMasterBarcode />} />
          <Route path="/inventory/stock_movement" element={<InventoryStockMovement />} />
          <Route path="/inventory/barcode" element={<StockBarcode />} />
          <Route path="/inventory/inventory_approval" element={<InventoryApproval />} />
          <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
          <Route path="/inventory/floor_manager" element={<InventoryFloorMaster />} />
          <Route path="/inventory/stock-master/add-stock" element={<AddToStockMaster />} />
          <Route path="/inventory/stock-master" element={<StockMaster />} />
          <Route path="/inventory/bom-master" element={<BomMaster />} />
          <Route path="/inventory/bom-master/create" element={<CreateBomMaster />} />
          <Route path="/inventory/bom-report" element={<BomReport />} />



          {/* production */}
          <Route path="/production/bom" element={<BomList />} />
          <Route path="/production/bom-draft" element={<BomDraftList />} />
          <Route path="/production/bom-published" element={<BomPublishedList />} />
          <Route path="/production/bom-delete" element={<BomDeleteList />} />
          <Route path="/production/bom/create-bom" element={<CreateBom />} />
          <Route path="/production/bom/view-bom/:bomId" element={<ViewBom />} />
          <Route path="/production/bom/edit-bom" element={<EditBom />} />
          <Route path="/production/all-production-process" element={<AllProductionProcessList />} />
          <Route path="/production/production-process-pending-list" element={<AllProductionProcessApprovePendingList />} />
          <Route path="/production/production-approved-list" element={<AllProductionProcessApproveList />} />
          <Route path="/production/production-test-pending-list" element={<AllProductionProcessTestPendingList />} />
          <Route path="/production/production-canceled-list" element={<AllProductionProcessCanceledList />} />
          <Route path="/production/production-repair-pending-list" element={<AllProductionProcessRepairPendingList />} />
          <Route path="/production/all-production-process/create-production" element={<CreateProduction />} />
          <Route path="/production/all-production-process/view-production/:id" element={<ViewProductionProcess />} />
          <Route path="/production/work-orders" element={<WorkOrders />} />
          <Route path="/production/work-orders-open" element={<WorkOrdersOpen />} />
          <Route path="/production/work-orders-planned" element={<WorkOrdersPlanned />} />
          <Route path="/production/work-orders-pending" element={<WorkOrdersPending />} />
          <Route path="/production/work-orders-wip" element={<WorkOrdersWip />} />
          <Route path="/production/work-orders-completed" element={<WorkOrdersCompleted />} />
          <Route path="/production/dispatch"   element={<ProductionDispatch />} />
          <Route path="/production/dashboard" element={<ProductionDashboard />} />
          <Route path="/production/sub-contract" element={<SubContract />} />
          <Route path="/production/sub-contract-approve-pending" element={<SubContractApprovePending />} />
          <Route path="/production/sub-contract-approve" element={<SubContractApprove />} />
          <Route path="/production/sub-contract-canceled" element={<SubContractCanceled />} />

          {/* payments   */}
          <Route path="/payment/document/receivable" element={<DocumentReceivable />} />
          <Route path="/payment/document/payable" element={<DocumentPayable />} />
          <Route path="/payment/document/receive" element={<DocumentReceive />} />
          <Route path="/payment/document/paid" element={<DocumentPaid />} />
          <Route path="/payment/document/overdue-receivable" element={<DocumentOverdueReceivable />} />
          <Route path="/payment/document/overdue-payable" element={<DocumentOverduePayable />} />
          <Route path="/payment/document/tax-invoice/:id" element={<TaxInvoice />} />
          <Route path="/opening-balance" element={<OpeningBalance />} />
          <Route path="/document/cn/create" element={<CreditNote />} />
          <Route path="/document/dn/create" element={<DebitNote />} />
          <Route path="/transaction/transaction-details/id" element={<TransactionDetails />} />
          <Route path="/payment/document/purchase-order/id" element={<PurchaseOrderInvoice />} />
          <Route path="/payment/document/inward-document/id" element={<InwardDocumentInvoice />} />
          <Route path="/document/grn/create/id" element={<GoodsReceiptNote />} />
          <Route path="/document/inward-document/create/id" element={<InwardDocumentNote />} />
          <Route path="/document/tax-invoice-document/create/id" element={<TaxInvoiceDocument />} />
          <Route path="/document/proforma-invoice-document/create/id" element={<ProformaInvoiceNote />} />
          <Route path="/document/receipt-voucher-document/create/id" element={<ReceiptVoucherNote />} />
          <Route path="/document/purchase-return-challan-document/create/id" element={<PurchaseReturnChallanNote />} />

          <Route path="/payment/company-ledger/all" element={<CompanyLedgerAll />} />
          <Route path="/payment/receipts/received" element={<PaymentReceiptReceived />} />
          <Route path="/payment/payments/paid" element={<PaymentPaymentsPaid />} />
          <Route path="/payment/document/log-details" element={<PaymentLogDetails />} />

          {/* pos */}
          <Route path="/reports/pos-dashboard" element={<PosDashboardIndex />} />
          <Route path="/pos" element={<Pos />} />
          <Route path="/pos/view-details" element={<ViewDetails />} />
          <Route path="/pos/order-status" element={<OrderStatus />} />
          <Route path="/pos/sales-data" element={<SalesData />} />
          <Route path="/pos/company-creation" element={<CompanyCreation />} />
          <Route path="/pos/thank-you" element={<PosThankYouPage />} />
          <Route path="/settings/pos/order" element={<PosOrder />} />
          {/* Reports */}
          <Route path="/reports" element={<ReportsIndex />} />
          <Route path="/report/report-genAI" element={<ReportGenerator />} />
          
          <Route path="/report/stock-ledger-report" element={<StockLedgerReport />} />
          <Route path="/report/fifo-lifo-stock-valuation-report" element={<FifoLifoStockValuation />} />
          <Route path="/report/inventory-valuation-summary" element={<InventoryValuationSummary />} />
          <Route path="/report/reorder-level-report" element={<ReorderLevelReport />} />
          <Route path="/report/aging-report" element={<AgingReport />} />
          <Route path="/report/bin-card-item-movement-report" element={<BinCardItemMovementReport />} />

          <Route path="/report/purchase-order-summary" element={<PurchaseOrderSummary />} />
          <Route path="/report/purchase-register" element={<PurchaseRegister />} />
          <Route path="/report/pending-po-report" element={<PendingPOReport />} />
          <Route path="/report/stock-transfer-report" element={<StockTransferReport />} />
          <Route path="/report/vendor-performance-report" element={<VendorPerformanceReport />} />
          <Route path="/report/purchase-rate-comparison" element={<PurchaseRateComparison />} />
          <Route path="/report/pr-to-po-conversion-report" element={<PrToPoConversionReport />} />
          <Route path="/report/month-wise-purchase-value" element={<MonthWisePurchaseValue />} />
          <Route path="/report/item-wise-purchase-report" element={<ItemWisePurchaseReport />} />
          <Route path="/report/sale-register" element={<SaleRegister />} />
          <Route path="/report/customer-wise-sales-report" element={<CustomerWiseSalesReport />} />
          <Route path="/report/item-wise-sales-report" element={<ItemWiseSalesReport />} />
          <Route path="/profitability-report" element={<ProfitabilityReport />} />
          <Route path="/report/top-selling-products-report" element={<TopSellingProductsReport />} />
          <Route path="/report/region-wise-sales-report" element={<RegionWiseSalesReport />} />
          <Route path="/backorder-report" element={<BackorderReport />} />

          <Route path="/report/slow-moving-item-report" element={<SlowMovingItemReport />} />
          <Route path="/report/stock-sale-analysis" element={<StockVsSaleAnalysis />} />
          <Route path="/report/purchase-consumption-report" element={<PurchaseVsConsumptionReport />} />
          <Route path="/report/abc-analysis-report" element={<AbcAnalysisReport />} />
          <Route path="/report/dead-stock-report" element={<DeadStockReport />} />
          <Route path="/report/mrp-report" element={<MrpReport />} />

          <Route path="/report/indent-requirement-report" element={<IndentRequirementReport />} />
          <Route path="/report/batch-expiry-report" element={<BatchExpiryReport />} />
          <Route path="/report/production/material-issue-report" element={<MaterialIssueReport />} />
         
          {/* welcome screen */}
          <Route path="/welcome" element={<WelcomeScreenIndex />} />




        </Route>
      </Routes>
    </Suspense>
  );
}

export default PrivateRoutes;
