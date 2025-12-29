import { RequestHandler } from "express";
import Invoice from "../models/Invoice";
import PurchaseOrder from "../models/PurchaseOrder";
import connection from "../db/connection";
import SKU from "../models/sku/SKU";
import PurchaseOrderRecord from "../models/PurchaseOrderRecord";
import Inventory from "../models/sku/Inventory";

interface GRNRecord {
    skuCode: string;
    receivedQty: number;
    damaged: number;
    expiryDate: string;
}

export const newInvoice: RequestHandler = async (req, res) => {
    const transaction = await connection.transaction();
    try {
        const { poCode, invoiceDate } = req.body;
        const grnRecords: GRNRecord[] = req.body.grnRecords || [];

        const purchaseOrder = await PurchaseOrder.findOne({ where: { poCode }, transaction });

        const skuCodes = grnRecords.map(record => record.skuCode);
        const skus = await SKU.findAll({
            where: { skuCode: skuCodes },
            transaction
        });

        // Create SKU code to ID mapping
        const skuMap = new Map(skus.map(sku => [sku.skuCode, sku.id]));

        // Validate all SKUs exist
        const missingSkus = skuCodes.filter(code => !skuMap.has(code));
        if (missingSkus.length > 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Some SKUs not found",
                data: { missingSkus }
            });
        }

        // Create new invoice
        const newInvoice = await Invoice.create({
            invoiceDate,
            poId: purchaseOrder?.id,
        }, { transaction });

        // Update existing records
        const updatePromises = grnRecords.map(record => {
            const skuId = skuMap.get(record.skuCode);
            if (!skuId) return null; // Skip if SKU not found

            // console.log(`Updating SKU: ${record.skuCode}, Received: ${record.receivedQty}, Damaged: ${record.damaged}, purchaseOrderId: ${purchaseOrder?.id}, skuId: ${skuId}`);

            return PurchaseOrderRecord.update(
                {
                    receivedQty: record.receivedQty,
                    damaged: record.damaged
                },
                {
                    where: {
                        purchaseOrderId: purchaseOrder?.id,
                        skuId: skuId
                    },
                    transaction
                }
            );
        }).filter(Boolean); // Remove null values

        // Execute all updates
        await Promise.all(updatePromises);

        const existingInventory = await Inventory.findAll({
            where: {
                skuId: [...skuMap.values()],
                expiryDate: grnRecords.map(record => record.expiryDate)
            },
            transaction
        });

        // Create a map for quick lookup of existing inventory
        const inventoryMap = new Map(
            existingInventory.map(inv => [`${inv.skuId}-${inv.expiryDate}`, inv])
        );

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
        await Inventory.bulkCreate(inventoryUpserts, {
            updateOnDuplicate: ['quantity'],
            transaction
        });
        await transaction.commit();

        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: {
                invoice: newInvoice,
                updatedRecords: grnRecords.length
            }
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "invoice.controller.js -> newInvoice"
            },
        });
    }
}