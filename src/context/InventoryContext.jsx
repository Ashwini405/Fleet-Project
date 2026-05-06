import React, { createContext, useMemo, useState } from 'react';
import {
  initialInventory, initialIssueHistory, initialMovementHistory,
  vendorList, dummyTruckList, warehouseList, initialPurchaseOrders,
} from '../pages/Parts/data/dummyData';

export const InventoryContext = createContext(null);

const CATEGORY_PREFIX = { Spares: 'SP', Lubricants: 'LB', Tyres: 'TY', Electrical: 'EL', Batteries: 'BT', Tools: 'TL', Others: 'OT' };
const today = new Date().toISOString().split('T')[0];

const calcStock = (item) => Math.max(0, Number(item.openingStock || 0) + Number(item.received || 0) - Number(item.issued || 0));

const buildStatus = (item) => {
  const s = calcStock(item);
  if (s === 0) return 'Out of Stock';
  if (s <= item.minStock) return 'Critical';
  if (s <= item.reorderLevel) return 'Low Stock';
  return 'In Stock';
};

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const diff = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 90;
};

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [issueHistory, setIssueHistory] = useState(initialIssueHistory);
  const [movementHistory, setMovementHistory] = useState(initialMovementHistory);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [lastEditedId, setLastEditedId] = useState(null);

  const inventoryWithStock = useMemo(() =>
    inventory.map((item) => ({
      ...item,
      currentStock: calcStock(item),
      stockStatus: buildStatus(item),
      expiringSoon: isExpiringSoon(item.expiryDate),
      inventoryValue: calcStock(item) * item.costPrice,
    })), [inventory]);

  const generatePartCode = (category = 'Others') => `${CATEGORY_PREFIX[category] || 'OT'}-${Math.floor(1000 + Math.random() * 9000)}`;

  const addInventoryItem = (payload) => {
    const duplicate = inventory.find((i) => i.name.trim().toLowerCase() === payload.name.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'Part with this name already exists.' };
    const newItem = {
      id: `P-${Date.now()}`, partCode: payload.partCode || generatePartCode(payload.category),
      name: payload.name.trim(), category: payload.category, brand: payload.brand?.trim() || '',
      unit: payload.unit, minStock: Number(payload.minStock) || 0, reorderLevel: Number(payload.reorderLevel) || 0,
      openingStock: Number(payload.openingStock) || 0, received: 0, issued: 0,
      costPrice: Number(payload.costPrice) || 0, sellingPrice: Number(payload.sellingPrice) || 0,
      preferredVendor: payload.preferredVendor || vendorList[0], location: payload.warehouse || warehouseList[0],
      warehouse: payload.warehouse || warehouseList[0], rack: payload.rack || '', bin: payload.bin || '',
      compatibleVehicles: payload.compatibleVehicles || [], vehicleType: payload.vehicleType || 'All',
      expiryDate: payload.expiryDate || '', warranty: payload.warranty || '', description: payload.description || '',
      createdDate: today, lastUpdated: today,
    };
    setInventory((prev) => [newItem, ...prev]);
    setLastAddedId(newItem.id);
    setTimeout(() => setLastAddedId(null), 3000);
    setMovementHistory((prev) => [{ id: `M-${Date.now()}`, date: today, type: 'Addition', partCode: newItem.partCode, partName: newItem.name, openingStock: 0, added: newItem.openingStock, used: 0, currentStock: calcStock(newItem), reference: 'New part created', user: 'Admin', warehouse: newItem.warehouse }, ...prev]);
    return { success: true, item: newItem };
  };

  const updateInventoryItem = (id, payload) => {
    setInventory((prev) => prev.map((item) =>
      item.id !== id ? item : {
        ...item,
        name: payload.name?.trim() || item.name,
        brand: payload.brand?.trim() || item.brand,
        partCode: payload.sku || item.partCode,
        category: payload.category || item.category,
        unit: payload.unit || item.unit,
        description: payload.description ?? item.description,
        openingStock: Number(payload.openingStock) ?? item.openingStock,
        minStock: Number(payload.minStock) ?? item.minStock,
        reorderLevel: Number(payload.reorderLevel) ?? item.reorderLevel,
        costPrice: Number(payload.costPrice) ?? item.costPrice,
        sellingPrice: Number(payload.sellingPrice) ?? item.sellingPrice,
        expiryDate: payload.expiryDate ?? item.expiryDate,
        warranty: payload.warranty ?? item.warranty,
        vehicleType: payload.vehicleType || item.vehicleType,
        serviceInterval: payload.serviceInterval ?? item.serviceInterval,
        compatibleVehicles: payload.compatibleVehicles ?? item.compatibleVehicles,
        preferredVendor: payload.preferredVendor || item.preferredVendor,
        gst: payload.gst ?? item.gst,
        vendorContact: payload.vendorContact ?? item.vendorContact,
        warehouse: payload.warehouse || item.warehouse,
        location: payload.warehouse || item.warehouse,
        rack: payload.rack ?? item.rack,
        bin: payload.bin ?? item.bin,
        notes: payload.notes ?? item.notes,
        lastUpdated: today,
      }
    ));
    setLastEditedId(id);
    setTimeout(() => setLastEditedId(null), 3000);
    return { success: true };
  };

  const deleteInventoryItem = (id) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  const stockIn = ({ partId, qty, costPerUnit, vendor, invoiceNumber, date, warehouse }) => {
    const item = inventory.find((e) => e.id === partId);
    if (!item) return { success: false, error: 'Item not found.' };
    const quantity = Number(qty) || 0;
    if (quantity <= 0) return { success: false, error: 'Quantity must be above zero.' };
    const openingStock = calcStock(item);
    const avgCost = openingStock + quantity > 0
      ? ((openingStock * item.costPrice) + quantity * Number(costPerUnit || item.costPrice)) / (openingStock + quantity)
      : Number(costPerUnit || item.costPrice);
    setInventory((prev) => prev.map((e) => e.id === partId ? { ...e, received: Number(e.received || 0) + quantity, costPrice: Number(avgCost.toFixed(2)), preferredVendor: vendor || e.preferredVendor, lastUpdated: today } : e));
    setMovementHistory((prev) => [{ id: `M-${Date.now()}`, date: date || today, type: 'Stock In', partCode: item.partCode, partName: item.name, openingStock, added: quantity, used: 0, currentStock: openingStock + quantity, reference: invoiceNumber || 'Purchase entry', user: 'Admin', warehouse: warehouse || item.warehouse }, ...prev]);
    return { success: true };
  };

  const stockOut = ({ partId, qty, vehicleNumber, serviceId, odometer, date, serviceType, costPerUnit, vendor }) => {
    const item = inventory.find((e) => e.id === partId);
    if (!item) return { success: false, error: 'Item not found.' };
    const quantity = Number(qty) || 0;
    const currentStock = calcStock(item);
    if (quantity <= 0) return { success: false, error: 'Quantity must be above zero.' };
    if (quantity > currentStock) return { success: false, error: 'Insufficient stock.' };
    setInventory((prev) => prev.map((e) => e.id === partId ? { ...e, issued: Number(e.issued || 0) + quantity, lastUpdated: today } : e));
    setIssueHistory((prev) => [{ id: `I-${Date.now()}`, date: date || today, partName: item.name, partCode: item.partCode, vehicleNumber: vehicleNumber || 'Unknown', odometer: `${odometer || 0} km`, qty: quantity, serviceType: serviceType || 'Repair', cost: Number(((costPerUnit || item.costPrice) * quantity).toFixed(2)), vendor: vendor || item.preferredVendor, serviceId: serviceId || `SR-${Date.now()}` }, ...prev]);
    setMovementHistory((prev) => [{ id: `M-${Date.now()}`, date: date || today, type: 'Stock Out', partCode: item.partCode, partName: item.name, openingStock: currentStock, added: 0, used: quantity, currentStock: currentStock - quantity, reference: serviceId || 'Service issue', user: 'Mechanic', warehouse: item.warehouse }, ...prev]);
    return { success: true };
  };

  const approvePO = (poId) => setPurchaseOrders((prev) => prev.map((po) => po.id === poId ? { ...po, status: 'Approved' } : po));
  const rejectPO = (poId) => setPurchaseOrders((prev) => prev.map((po) => po.id === poId ? { ...po, status: 'Rejected' } : po));
  const receivePO = (poId) => setPurchaseOrders((prev) => prev.map((po) => po.id === poId ? { ...po, status: 'Received' } : po));

  const importInventoryCsv = (csvText) => {
    if (!csvText) return { success: false, error: 'No CSV content provided.' };
    const rows = csvText.trim().split(/\r?\n/).map((l) => l.split(',').map((c) => c.trim()));
    const [header, ...dataRows] = rows;
    const h = header.map((c) => c.toLowerCase());
    let imported = 0;
    dataRows.forEach((row) => {
      const d = Object.fromEntries(row.map((v, i) => [h[i], v]));
      if (!d.name || !d.category) return;
      const r = addInventoryItem({ name: d.name, category: d.category, brand: d.brand || '', unit: d.unit || 'pcs', minStock: Number(d.minstock) || 0, reorderLevel: Number(d.reorderlevel) || 0, openingStock: Number(d.openingstock) || 0, costPrice: Number(d.costprice) || 0, sellingPrice: Number(d.sellingprice) || 0, preferredVendor: d.preferredvendor || vendorList[0], warehouse: d.warehouse || warehouseList[0] });
      if (r.success) imported++;
    });
    return { success: true, imported };
  };

  const exportInventoryReport = () => {
    const header = ['Part Code', 'Part Name', 'Category', 'Brand', 'Unit', 'Current Stock', 'Min Stock', 'Cost Price', 'Vendor', 'Warehouse', 'Status'];
    const rows = inventoryWithStock.map((i) => [i.partCode, i.name, i.category, i.brand, i.unit, i.currentStock, i.minStock, i.costPrice, i.preferredVendor, i.warehouse, i.stockStatus]);
    return [header, ...rows].map((r) => r.join(',')).join('\n');
  };

  const summary = useMemo(() => {
    const totalPartsCount = inventoryWithStock.length;
    const lowStockCount = inventoryWithStock.filter((i) => i.stockStatus === 'Low Stock' || i.stockStatus === 'Critical').length;
    const outOfStockCount = inventoryWithStock.filter((i) => i.stockStatus === 'Out of Stock').length;
    const criticalCount = inventoryWithStock.filter((i) => i.stockStatus === 'Critical').length;
    const expiringCount = inventoryWithStock.filter((i) => i.expiringSoon).length;
    const totalInventoryValue = inventoryWithStock.reduce((s, i) => s + i.inventoryValue, 0);
    const pendingPOs = purchaseOrders.filter((p) => p.status === 'Pending').length;
    const activeVendors = new Set(inventoryWithStock.map((i) => i.preferredVendor)).size;
    const monthlyConsumption = issueHistory.filter((i) => i.date >= today.slice(0, 7)).reduce((s, i) => s + Number(i.qty || 0), 0);
    const topPartsUsed = Object.entries(issueHistory.reduce((acc, e) => { acc[e.partName] = (acc[e.partName] || 0) + Number(e.qty || 0); return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }));
    return { totalPartsCount, lowStockCount, outOfStockCount, criticalCount, expiringCount, totalInventoryValue, pendingPOs, activeVendors, monthlyConsumption, topPartsUsed };
  }, [inventoryWithStock, issueHistory, purchaseOrders]);

  return (
    <InventoryContext.Provider value={{ inventory: inventoryWithStock, issueHistory, movementHistory, purchaseOrders, vendorList, dummyTruckList, warehouseList, summary, lastAddedId, lastEditedId, addInventoryItem, updateInventoryItem, deleteInventoryItem, stockIn, stockOut, approvePO, rejectPO, receivePO, importInventoryCsv, exportInventoryReport }}>
      {children}
    </InventoryContext.Provider>
  );
}
