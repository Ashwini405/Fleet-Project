import React, { createContext, useMemo, useState } from 'react';
import {
  initialInventory,
  initialIssueHistory,
  initialMovementHistory,
  vendorList,
  dummyTruckList,
} from '../pages/Parts/data/dummyData';

export const InventoryContext = createContext(null);

const CATEGORY_PREFIX = {
  Spares: 'SP',
  Lubricant: 'LB',
  Tyre: 'TY',
  Electrical: 'EL',
  Others: 'OT',
};

const today = new Date().toISOString().split('T')[0];

const calculateCurrentStock = (item) => {
  return Math.max(0, Number(item.openingStock || 0) + Number(item.received || 0) - Number(item.issued || 0));
};

const buildStockStatus = (item) => {
  const stock = calculateCurrentStock(item);
  if (stock === 0) return 'Out of Stock';
  if (stock <= item.minStock) return 'Critical';
  if (stock <= item.minStock * 1.5) return 'Low';
  return 'Safe';
};

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [issueHistory, setIssueHistory] = useState(initialIssueHistory);
  const [movementHistory, setMovementHistory] = useState(initialMovementHistory);

  const inventoryWithStock = useMemo(
    () => inventory.map((item) => ({
      ...item,
      currentStock: calculateCurrentStock(item),
      stockStatus: buildStockStatus(item),
    })),
    [inventory]
  );

  const generatePartCode = (category = 'Others') => {
    const prefix = CATEGORY_PREFIX[category] || 'OT';
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const addInventoryItem = (payload) => {
    const duplicate = inventory.find(
      (item) => item.name.trim().toLowerCase() === payload.name.trim().toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: 'Part with this name already exists.' };
    }

    const newInventoryItem = {
      id: `P-${Date.now()}`,
      partCode: payload.partCode || generatePartCode(payload.category),
      name: payload.name.trim(),
      category: payload.category,
      brand: payload.brand.trim(),
      unit: payload.unit,
      minStock: Number(payload.minStock) || 0,
      openingStock: Number(payload.openingStock) || 0,
      received: 0,
      issued: 0,
      costPrice: Number(payload.costPrice) || 0,
      sellingPrice: Number(payload.sellingPrice) || 0,
      preferredVendor: payload.preferredVendor.trim() || payload.vendor,
      location: payload.location,
      createdDate: payload.createdDate || today,
    };

    setInventory((prev) => [newInventoryItem, ...prev]);
    setMovementHistory((prev) => [
      {
        id: `M-${Date.now()}`,
        date: newInventoryItem.createdDate,
        type: 'Addition',
        partCode: newInventoryItem.partCode,
        partName: newInventoryItem.name,
        openingStock: 0,
        added: newInventoryItem.openingStock,
        used: 0,
        currentStock: calculateCurrentStock(newInventoryItem),
        reference: 'New part created',
      },
      ...prev,
    ]);

    return { success: true, item: newInventoryItem };
  };

  const stockIn = ({ partId, qty, costPerUnit, vendor, invoiceNumber, date }) => {
    const item = inventory.find((entry) => entry.id === partId);
    if (!item) return { success: false, error: 'Selected inventory item is not available.' };
    const quantity = Number(qty) || 0;
    if (quantity <= 0) return { success: false, error: 'Quantity added must be above zero.' };

    const openingStock = calculateCurrentStock(item);
    const nextReceived = Number(item.received || 0) + quantity;
    const averageCost = openingStock + quantity > 0
      ? ((openingStock * Number(item.costPrice || 0)) + quantity * Number(costPerUnit || item.costPrice || 0)) / (openingStock + quantity)
      : Number(costPerUnit || item.costPrice || 0);

    setInventory((prev) =>
      prev.map((entry) =>
        entry.id === partId
          ? {
              ...entry,
              received: nextReceived,
              costPrice: Number(averageCost.toFixed(2)),
              preferredVendor: vendor || entry.preferredVendor,
            }
          : entry
      )
    );

    const currentStock = openingStock + quantity;
    setMovementHistory((prev) => [
      {
        id: `M-${Date.now()}`,
        date: date || today,
        type: 'Stock In',
        partCode: item.partCode,
        partName: item.name,
        openingStock,
        added: quantity,
        used: 0,
        currentStock,
        reference: invoiceNumber || 'Purchase entry',
      },
      ...prev,
    ]);

    return { success: true };
  };

  const stockOut = ({ partId, qty, vehicleNumber, serviceId, odometer, date, serviceType, costPerUnit, vendor }) => {
    const item = inventory.find((entry) => entry.id === partId);
    if (!item) return { success: false, error: 'Selected inventory item is not available.' };
    const quantity = Number(qty) || 0;
    const currentStock = calculateCurrentStock(item);
    if (quantity <= 0) return { success: false, error: 'Quantity used must be above zero.' };
    if (quantity > currentStock) return { success: false, error: 'Insufficient stock for this issue.' };

    const nextIssued = Number(item.issued || 0) + quantity;
    const unitCost = Number(costPerUnit || item.costPrice || 0);

    setInventory((prev) =>
      prev.map((entry) =>
        entry.id === partId
          ? {
              ...entry,
              issued: nextIssued,
              preferredVendor: vendor || entry.preferredVendor,
            }
          : entry
      )
    );

    setIssueHistory((prev) => [
      {
        id: `I-${Date.now()}`,
        date: date || today,
        partName: item.name,
        partCode: item.partCode,
        vehicleNumber: vehicleNumber || 'Unknown',
        odometer: `${odometer || 0} km`,
        qty: quantity,
        serviceType: serviceType || 'Repair',
        cost: Number((unitCost * quantity).toFixed(2)),
        vendor: vendor || item.preferredVendor,
        serviceId: serviceId || `SR-${Date.now()}`,
      },
      ...prev,
    ]);

    setMovementHistory((prev) => [
      {
        id: `M-${Date.now()}`,
        date: date || today,
        type: 'Stock Out',
        partCode: item.partCode,
        partName: item.name,
        openingStock: currentStock,
        added: 0,
        used: quantity,
        currentStock: currentStock - quantity,
        reference: serviceId || 'Service issue',
      },
      ...prev,
    ]);

    return { success: true };
  };

  const importInventoryCsv = (csvText) => {
    if (!csvText) {
      return { success: false, error: 'No CSV content provided.' };
    }

    const rows = csvText
      .trim()
      .split(/\r?\n/)
      .map((line) => line.split(',').map((cell) => cell.trim()));

    const [header, ...dataRows] = rows;
    const normalizedHeader = header.map((col) => col.toLowerCase());
    const expected = ['name', 'category', 'brand', 'unit', 'minstock', 'openingstock', 'costprice', 'sellingprice', 'preferredvendor', 'location', 'createddate'];

    if (!expected.every((field) => normalizedHeader.includes(field))) {
      return { success: false, error: 'CSV header must include name, category, brand, unit, minStock, openingStock, costPrice, sellingPrice, preferredVendor, location, createdDate.' };
    }

    let imported = 0;
    const addedItems = [];

    dataRows.forEach((row) => {
      const rowData = Object.fromEntries(row.map((value, index) => [normalizedHeader[index], value]));
      if (!rowData.name || !rowData.category) return;
      const existing = inventory.find((item) => item.name.trim().toLowerCase() === rowData.name.trim().toLowerCase());
      if (existing) return;

      const payload = {
        name: rowData.name,
        category: rowData.category,
        brand: rowData.brand || 'Unknown',
        unit: rowData.unit || 'pcs',
        minStock: Number(rowData.minstock) || 0,
        openingStock: Number(rowData.openingstock) || 0,
        costPrice: Number(rowData.costprice) || 0,
        sellingPrice: Number(rowData.sellingprice) || 0,
        preferredVendor: rowData.preferredvendor || 'Unknown Vendor',
        location: rowData.location || 'Main Warehouse',
        createdDate: rowData.createddate || today,
      };
      const result = addInventoryItem(payload);
      if (result.success) {
        imported += 1;
        addedItems.push(result.item.partCode);
      }
    });

    return { success: true, imported, addedItems };
  };

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
      'Selling Price',
      'Vendor',
      'Location',
      'Created Date',
    ];

    const rows = inventoryWithStock.map((item) => [
      item.partCode,
      item.name,
      item.category,
      item.brand,
      item.unit,
      item.currentStock,
      item.minStock,
      item.costPrice,
      item.sellingPrice,
      item.preferredVendor,
      item.location,
      item.createdDate,
    ]);

    return [header, ...rows].map((row) => row.join(',')).join('\n');
  };

  const summary = useMemo(() => {
    const totalPartsCount = inventoryWithStock.length;
    const lowStockCount = inventoryWithStock.filter((item) => item.currentStock <= item.minStock && item.currentStock > 0).length;
    const outOfStockCount = inventoryWithStock.filter((item) => item.currentStock === 0).length;
    const totalInventoryValue = inventoryWithStock.reduce(
      (sum, item) => sum + item.currentStock * item.costPrice,
      0
    );

    const vendorByCount = inventoryWithStock.reduce((acc, item) => {
      acc[item.preferredVendor] = (acc[item.preferredVendor] || 0) + 1;
      return acc;
    }, {});

    const usageByPart = issueHistory.reduce((acc, entry) => {
      acc[entry.partName] = (acc[entry.partName] || 0) + Number(entry.qty || 0);
      return acc;
    }, {});

    const topPartsUsed = Object.entries(usageByPart)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    const monthlyConsumption = issueHistory.reduce((acc, entry) => {
      const month = entry.date ? entry.date.slice(0, 7) : today.slice(0, 7);
      acc[month] = (acc[month] || 0) + Number(entry.qty || 0);
      return acc;
    }, {});

    return {
      totalPartsCount,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
      vendorByCount,
      topPartsUsed,
      monthlyConsumption,
      truckList: dummyTruckList,
    };
  }, [inventoryWithStock, issueHistory]);

  return (
    <InventoryContext.Provider
      value={{
        inventory: inventoryWithStock,
        issueHistory,
        movementHistory,
        vendorList,
        dummyTruckList,
        summary,
        addInventoryItem,
        stockIn,
        stockOut,
        importInventoryCsv,
        exportInventoryReport,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}
