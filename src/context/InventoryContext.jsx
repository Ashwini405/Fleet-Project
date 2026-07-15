import React, { createContext, useMemo, useState, useEffect } from 'react';
import api from '../services/api';



export const InventoryContext = createContext(null);

const CATEGORY_PREFIX = {
  Spares: 'SP',
  Lubricants: 'LB',
  Tyres: 'TY',
  Electrical: 'EL',
  Batteries: 'BT',
  Tools: 'TL',
  Others: 'OT'
};

const today = new Date().toISOString().split('T')[0];

const calcStock = (item) =>
  Math.max(
    0,
    Number(item.opening_stock || 0) +
    Number(item.received || 0) -
    Number(item.issued || 0)
  );

const buildStatus = (item) => {
  const s = calcStock(item);

  if (s === 0) return 'Out of Stock';
  if (s <= item.min_stock) return 'Critical';
  if (s <= item.reorder_level) return 'Low Stock';

  return 'In Stock';
};

const isExpiringSoon = (expiryDate) => {

  if (!expiryDate) return false;

  const diff =
    (new Date(expiryDate) - new Date()) /
    (1000 * 60 * 60 * 24);

  return diff >= 0 && diff <= 90;
};

export function InventoryProvider({ children }) {

  // ✅ DATABASE INVENTORY
  const [inventory, setInventory] = useState([]);

  // ✅ LOCAL SUPPORTING STATES
  const [issueHistory, setIssueHistory] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Add a locally-created PO (frontend-only, before backend is connected)
  const addLocalPO = (po) => {
    if (!po) return;
    setPurchaseOrders(prev => [po, ...prev]);
  };
  const [vendorList, setVendorList] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [lastEditedId, setLastEditedId] = useState(null);


  // ✅ FETCH INVENTORY FROM DATABASE
  useEffect(() => {
    fetchInventory();
    fetchMovementHistory();
    fetchIssueHistory();
    fetchPurchaseOrders();
    fetchVendors();
    fetchWarehouses();
     fetchVehicles();


  }, []);


  const fetchInventory = async () => {

    try {

      const res = await api.get(
        '/inventory'
      );

      // ✅ NORMALIZE DATABASE FIELDS
      const normalized = res.data.data.map((item) => ({

        ...item,

        name: item.part_name,
        partCode: item.sku,

        currentStock: Number(item.current_stock || 0),

        minStock: Number(item.min_stock || 0),

        reorderLevel: Number(item.reorder_level || 0),

        costPrice: Number(item.cost_price || 0),

        sellingPrice: Number(item.selling_price || 0),

        inventoryValue: Number(item.inventory_value || 0),

        stockStatus: item.stock_status,

        preferredVendor: item.preferred_vendor,

        vehicleType: item.vehicle_type,

        compatibleVehicles:
          typeof item.compatible_vehicles === 'string'
            ? JSON.parse(item.compatible_vehicles || '[]')
            : item.compatible_vehicles || [],

        serviceInterval: item.service_interval,

        vendorContact: item.vendor_contact,

        rack: item.rack_no,

        bin: item.bin_no,

        expiryDate: item.expiry_date,

        expiringSoon: isExpiringSoon(item.expiry_date),
      }));

      setInventory(normalized);

    } catch (error) {

      console.error(
        'FETCH INVENTORY ERROR:',
        error
      );
    }
  };

  const fetchMovementHistory = async () => {

    try {

      const res = await api.get(
        '/inventory/movement-history'
      );

      const formatted = res.data.data.map((item) => ({

        id: item.id,

        date: item.movement_date,

        partName: item.part_name,

        type: item.movement_type,

        openingStock: item.opening_stock || 0,

        added:
          item.movement_type === 'Stock In'
            ? item.quantity
            : 0,

        used:
          item.movement_type === 'Stock Out'
            ? item.quantity
            : 0,

        currentStock: item.current_stock || 0,

        reference:
          item.invoice_number ||
          item.service_id ||
          '-'
      }));

      setMovementHistory(formatted);

    } catch (error) {

      console.error(
        'MOVEMENT HISTORY ERROR:',
        error
      );
    }
  };
  const fetchIssueHistory = async () => {

    try {

      const res = await api.get(
        '/inventory/issue-history'
      );

      const formatted = res.data.data.map((item) => ({

        id: item.id,

        date: item.issue_date,

        partName: item.part_name,

        vehicleNumber: item.vehicle_number,

        qty: item.quantity,

        serviceType: item.service_type,

        vendor: item.vendor,

        cost:
          Number(item.quantity || 0) *
          Number(item.cost_per_unit || 0)
      }));

      setIssueHistory(formatted);

    } catch (error) {

      console.error(
        'ISSUE HISTORY ERROR:',
        error
      );
    }
  };

  const fetchPurchaseOrders = async () => {

    try {

      const res = await api.get(
        '/inventory/purchase-orders'
      );

      const formatted = res.data.data.map((po) => ({

        ...po,

        poNumber: po.po_number,

        expectedDelivery: po.expected_delivery,

        totalAmount:
          Number(po.total_amount || 0),

        items:
          typeof po.items === 'string'
            ? JSON.parse(po.items || '[]')
            : po.items || []
      }));


      setPurchaseOrders(formatted);

    } catch (error) {

      console.error(
        'FETCH PURCHASE ORDERS ERROR:',
        error
      );
    }
  };

  const fetchVendors = async () => {

    try {

      const res = await api.get(
        '/inventory/vendors'
      );

      const formatted = res.data.data.map((v) => (

        v.vendor_name
      ));

      setVendorList(formatted);

    } catch (error) {

      console.error(
        'FETCH VENDORS ERROR:',
        error
      );
    }
  };

  const fetchWarehouses = async () => {

    try {

      const res = await api.get(
        '/inventory/warehouses'
      );

      const formatted = res.data.data.map((w) => (

        w.warehouse_name
      ));

      setWarehouseList(formatted);

    } catch (error) {

      console.error(
        'FETCH WAREHOUSES ERROR:',
        error
      );
    }
  };
  const fetchVehicles = async () => {

  try {

    const res = await api.get(
      '/vehicles'
    );

    // ✅ KEEP COMPLETE OBJECTS
    setVehicleList(res.data.data);

  } catch (error) {

    console.error(
      'FETCH VEHICLES ERROR:',
      error
    );
  }
};
  // ✅ ADD INVENTORY
  const addInventoryItem = async (formData) => {

    try {

      const res = await api.post(
        '/inventory',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchInventory();

      return {
        success: true,
        data: res.data
      };

    } catch (error) {

      console.error(
        'ADD INVENTORY ERROR:',
        error
      );

      return {
        success: false,
        error: error.message
      };
    }
  };


  // ✅ UPDATE INVENTORY
  const updateInventoryItem = async (id, formData) => {

    try {

      await api.put(
        `/inventory/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setLastEditedId(id);

      setTimeout(() => {
        setLastEditedId(null);
      }, 3000);

      await fetchInventory();

      return {
        success: true
      };

    } catch (error) {

      console.error(
        'UPDATE ERROR:',
        error
      );

      return {
        success: false,
        error: error.message
      };
    }
  };


  // ✅ DELETE INVENTORY
  const deleteInventoryItem = async (id) => {

    try {

      await api.delete(
        `/inventory/${id}`
      );

      await fetchInventory();

      return {
        success: true
      };

    } catch (error) {

      console.error(
        'DELETE ERROR:',
        error
      );

      return {
        success: false,
        error: error.message
      };
    }
  };


  // ✅ STOCK IN
  const stockIn = async ({
    partId,
    qty,
    costPerUnit,
    vendor,
    invoiceNumber,
    date
  }) => {

    try {

      const item = inventory.find(
        (e) => e.id === partId
      );

      if (!item) {

        return {
          success: false,
          error: 'Item not found.'
        };
      }

      const quantity = Number(qty) || 0;

      if (quantity <= 0) {

        return {
          success: false,
          error: 'Quantity must be above zero.'
        };
      }


      // ✅ API CALL
      const res = await api.post(

        '/inventory/stock-in',

        {

          partId,
          qty,
          costPerUnit,
          vendor,
          invoiceNumber,
          date
        }
      );


      // ✅ REFRESH INVENTORY
      await fetchInventory();


      return {

        success: true,
        data: res.data
      };

    } catch (error) {

      console.error(
        'STOCK IN ERROR:',
        error
      );

      return {

        success: false,
        error: error.message
      };
    }
  };


  // ✅ STOCK OUT
  const stockOut = async ({

    partId,
    qty,
    vehicleNumber,
    odometer,
    serviceId,
    date,
    serviceType,
    costPerUnit,
    vendor

  }) => {

    try {

      const item = inventory.find(
        (e) => e.id === partId
      );

      if (!item) {

        return {
          success: false,
          error: 'Item not found.'
        };
      }

      const quantity =
        Number(qty) || 0;

      if (quantity <= 0) {

        return {
          success: false,
          error:
            'Quantity must be above zero.'
        };
      }


      // ✅ API CALL
      const res = await api.post(

        '/inventory/stock-out',

        {

          partId,
          qty,
          vehicleNumber,
          odometer,
          serviceId,
          date,
          serviceType,
          costPerUnit,
          vendor
        }
      );


      // ✅ REFRESH INVENTORY
      await fetchInventory();


      return {

        success: true,
        data: res.data
      };

    } catch (error) {

      console.error(
        'STOCK OUT ERROR:',
        error
      );

      return {

        success: false,
        error: error.message
      };
    }
  };


  // ✅ PURCHASE ORDER ACTIONS
  const approvePO = async (poId, approver_name, approval_comment) => {
    try {
      await api.put(
        `/inventory/purchase-orders/${poId}/approve`,
        { approver_name, approval_comment }
      );
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      console.error('APPROVE PO ERROR:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const rejectPO = async (poId, approver_name, approval_comment) => {
    try {
      await api.put(
        `/inventory/purchase-orders/${poId}/reject`,
        { approver_name, approval_comment }
      );
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      console.error('REJECT PO ERROR:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const holdPO = async (poId, approver_name, approval_comment) => {
    try {
      await api.put(
        `/inventory/purchase-orders/${poId}/hold`,
        { approver_name, approval_comment }
      );
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      console.error('HOLD PO ERROR:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const orderPO = async (poId) => {
    try {
      await api.put(
        `/inventory/purchase-orders/${poId}/order`
      );
      await fetchPurchaseOrders();
      return { success: true };
    } catch (error) {
      console.error('ORDER PO ERROR:', error);
      return { success: false, error: error.message };
    }
  };

  const receivePO = async (poId) => {
    try {
      await api.put(
        `/inventory/purchase-orders/${poId}/receive`
      );
      await fetchPurchaseOrders();
      await fetchInventory();
      return { success: true };
    } catch (error) {
      console.error('RECEIVE PO ERROR:', error);
      return { success: false, error: error.message };
    }
  };


  // ✅ EXPORT REPORT
  const exportInventoryReport = () => {

    const header = [
      'Part Code',
      'Part Name',
      'Category',
      'Brand',
      'Unit',
      'Current Stock',
      'Min Stock',
      'Cost Price',
      'Vendor',
      'Warehouse',
      'Status'
    ];

    const rows = inventory.map((i) => [
      i.partCode,
      i.name,
      i.category,
      i.brand,
      i.unit,
      i.currentStock,
      i.minStock,
      i.costPrice,
      i.preferredVendor,
      i.warehouse,
      i.stockStatus
    ]);

    return [header, ...rows]
      .map((r) => r.join(','))
      .join('\n');
  };


  // ✅ SUMMARY
  const summary = useMemo(() => {

    const totalPartsCount = inventory.length;

    const lowStockCount = inventory.filter(
      (i) =>
        i.stockStatus === 'Low Stock' ||
        i.stockStatus === 'Critical'
    ).length;

    const outOfStockCount = inventory.filter(
      (i) =>
        i.stockStatus === 'Out of Stock'
    ).length;

    const criticalCount = inventory.filter(
      (i) =>
        i.stockStatus === 'Critical'
    ).length;

    const expiringCount = inventory.filter(
      (i) =>
        i.expiringSoon
    ).length;

    const totalInventoryValue = inventory.reduce(
      (s, i) =>
        s + Number(i.inventoryValue || 0),
      0
    );

    const pendingPOs = purchaseOrders.filter(
      (p) => p.status_id === 0
    ).length;

    const activeVendors = new Set(
      inventory.map(
        (i) => i.preferredVendor
      )
    ).size;

    return {
      totalPartsCount,
      lowStockCount,
      outOfStockCount,
      criticalCount,
      expiringCount,
      totalInventoryValue,
      pendingPOs,
      activeVendors,
    };

  }, [inventory, purchaseOrders]);


  return (
    <InventoryContext.Provider
      value={{

        inventory,

        issueHistory,
        movementHistory,
        purchaseOrders,

        vendorList,
        vehicleList,
        warehouseList,

        summary,

        lastAddedId,
        lastEditedId,

        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,

        stockIn,
        stockOut,

        approvePO,
        rejectPO,
        holdPO,
        orderPO,
        receivePO,
        addLocalPO,

        exportInventoryReport,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}