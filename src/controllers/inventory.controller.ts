import { RequestHandler } from "express";
import SKU from "../models/sku/SKU";
import SKUDetails from "../models/sku/SKUDetails";
import Inventory from "../models/sku/Inventory";

export const getInventory: RequestHandler = async (req, res) => {
    try {
        const skus = await SKU.findAll({
            include: [
                {
                    model: SKUDetails,
                    required: true, // ensures SKUDetails is fetched
                },
                {
                    model: Inventory,
                    required: false, // inventory might be empty
                },
            ],
        });

        const inventory = skus.map(sku => {
            const details = sku.details;
            return {
                "SKU Code": sku.skuCode,
                "Category": details ? details.category : null,
                "Product Title": sku.name,
                "SAP Code": details ? details.sapCode : null,
                "HSN": details ? details.hsn : null,
                "EAN": sku.ean,
                "Model Number": details ? details.modelNumber : null,
                "Current Inventory": sku.inventory ? sku.inventory.map(inv => ({
                    count: inv.quantity,
                    expiry: inv.expiryDate,
                })) : []
            };
        });

        return res.status(200).json({
            success: true,
            message: "Inventory retrieved successfully",
            data: { inventory }
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "inventory.controller.js -> getInventory"
            },
        });
    }

}