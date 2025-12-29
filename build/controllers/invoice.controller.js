"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newInvoice = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const connection_1 = __importDefault(require("../db/connection"));
const SKU_1 = __importDefault(require("../models/sku/SKU"));
const PurchaseOrderRecord_1 = __importDefault(require("../models/PurchaseOrderRecord"));
const Inventory_1 = __importDefault(require("../models/sku/Inventory"));
const newInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connection_1.default.transaction();
    try {
        const { poCode, invoiceDate } = req.body;
        const grnRecords = req.body.grnRecords || [];
        const purchaseOrder = yield PurchaseOrder_1.default.findOne({ where: { poCode }, transaction });
        const skuCodes = grnRecords.map(record => record.skuCode);
        const skus = yield SKU_1.default.findAll({
            where: { skuCode: skuCodes },
            transaction
        });
        // Create SKU code to ID mapping
        const skuMap = new Map(skus.map(sku => [sku.skuCode, sku.id]));
        // Validate all SKUs exist
        const missingSkus = skuCodes.filter(code => !skuMap.has(code));
        if (missingSkus.length > 0) {
            yield transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Some SKUs not found",
                data: { missingSkus }
            });
        }
        // Create new invoice
        const newInvoice = yield Invoice_1.default.create({
            invoiceDate,
            poId: purchaseOrder === null || purchaseOrder === void 0 ? void 0 : purchaseOrder.id,
        }, { transaction });
        // Update existing records
        const updatePromises = grnRecords.map(record => {
            const skuId = skuMap.get(record.skuCode);
            if (!skuId)
                return null; // Skip if SKU not found
            // console.log(`Updating SKU: ${record.skuCode}, Received: ${record.receivedQty}, Damaged: ${record.damaged}, purchaseOrderId: ${purchaseOrder?.id}, skuId: ${skuId}`);
            return PurchaseOrderRecord_1.default.update({
                receivedQty: record.receivedQty,
                damaged: record.damaged
            }, {
                where: {
                    purchaseOrderId: purchaseOrder === null || purchaseOrder === void 0 ? void 0 : purchaseOrder.id,
                    skuId: skuId
                },
                transaction
            });
        }).filter(Boolean); // Remove null values
        // Execute all updates
        yield Promise.all(updatePromises);
        const existingInventory = yield Inventory_1.default.findAll({
            where: {
                skuId: [...skuMap.values()],
                expiryDate: grnRecords.map(record => record.expiryDate)
            },
            transaction
        });
        // Create a map for quick lookup of existing inventory
        const inventoryMap = new Map(existingInventory.map(inv => [`${inv.skuId}-${inv.expiryDate}`, inv]));
        // Prepare bulk operations
        const inventoryUpserts = grnRecords.map(record => {
            const skuId = skuMap.get(record.skuCode);
            const key = `${skuId}-${record.expiryDate}`;
            const existingRecord = inventoryMap.get(key);
            const netQuantity = record.receivedQty - record.damaged;
            return {
                skuId,
                expiryDate: record.expiryDate,
                quantity: existingRecord ? existingRecord.quantity + netQuantity : netQuantity
            };
        });
        // Perform bulk upsert
        yield Inventory_1.default.bulkCreate(inventoryUpserts, {
            updateOnDuplicate: ['quantity'],
            transaction
        });
        yield transaction.commit();
        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: {
                invoice: newInvoice,
                updatedRecords: grnRecords.length
            }
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "invoice.controller.js -> newInvoice"
            },
        });
    }
});
exports.newInvoice = newInvoice;
