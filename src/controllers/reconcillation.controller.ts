import { RequestHandler } from "express";
import Vendor from "../models/vendor/Vendor";
import BuyingOrder from "../models/PurchaseOrder";
import BuyingOrderRecord from "../models/PurchaseOrderRecord";
import { Sequelize } from "sequelize";
import SKU from "../models/sku/SKU";
import BuyingOrderOther from "../models/BuyingOrderOther";
import BOInvoices from "../models/BOInvoices";
import File from "../models/File";

export const getApprovedPOs: RequestHandler = async (req, res) => {
    try {
        const buyingOrders: any[] = await BuyingOrder.findAll({
            where: { isVerified: true },
            attributes: ['id', 'poCode', [Sequelize.col('vendor.vendorCode'), 'vendorCode'], [Sequelize.col('vendor.companyName'), 'vendorName']],
            include: [
                {
                    model: Vendor,
                },
                {
                    model: BuyingOrderRecord
                }
            ]
        })

        const transformedBuyingOrders: any[] = []
        for (let i = 0; i < buyingOrders.length; i++) {
            const buyingOrder = buyingOrders[i];
            const transformedBuyingOrder = {
                id: buyingOrder.id,
                poCode: buyingOrder.poCode,
                vendorCode: buyingOrder.vendor.vendorCode,
                vendorName: buyingOrder.vendor.companyName,
                units: buyingOrder.records.reduce((sum: number, record: any) => sum + record.expectedQty, 0),
                amount: buyingOrder.records.reduce((sum: number, record: any) => {
                    const costPerUnit = parseFloat(record.unitCost);
                    const gstPercentage = parseFloat(record.gst) / 100;
                    const totalCostPerItem = costPerUnit + (costPerUnit * gstPercentage);
                    return sum + (totalCostPerItem * record.expectedQty);
                }, 0),
                status: buyingOrder.closed ? 'closed' : 'open'
            }
            transformedBuyingOrders.push(transformedBuyingOrder)
        }

        return res.status(201).json({
            success: true,
            message: `Your pos have been fetched`,
            data: { pos: transformedBuyingOrders },
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> getApprovedPOs"
            },
        });
    }
}

export const getAllPOs: RequestHandler = async (req, res) => {
    try {
        const buyingOrders: any[] = await BuyingOrder.findAll({
            attributes: ['id', 'poCode', [Sequelize.col('vendor.vendorCode'), 'vendorCode'], [Sequelize.col('vendor.companyName'), 'vendorName'], 'isVerified', 'closed'],
            include: [
                {
                    model: Vendor,
                },
                {
                    model: BuyingOrderRecord
                }
            ]
        })

        const transformedBuyingOrders: any[] = []
        for (let i = 0; i < buyingOrders.length; i++) {
            const buyingOrder = buyingOrders[i];
            const transformedBuyingOrder = {
                id: buyingOrder.id,
                poCode: buyingOrder.poCode,
                vendorCode: buyingOrder.vendor.vendorCode,
                vendorName: buyingOrder.vendor.companyName,
                units: buyingOrder.records.reduce((sum: number, record: any) => sum + record.expectedQty, 0),
                amount: buyingOrder.records.reduce((sum: number, record: any) => {
                    const costPerUnit = parseFloat(record.unitCost);
                    const gstPercentage = parseFloat(record.gst) / 100;
                    const totalCostPerItem = costPerUnit + (costPerUnit * gstPercentage);
                    return sum + (totalCostPerItem * record.expectedQty);
                }, 0),
                status: buyingOrder.isVerified ? (buyingOrder.closed ? 'Closed' : 'Open') : 'Unverified'
            }
            transformedBuyingOrders.push(transformedBuyingOrder)
        }

        return res.status(201).json({
            success: true,
            message: `Your pos have been fetched`,
            data: { pos: transformedBuyingOrders },
        });
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> getApprovedPOs"
            },
        });
    }
}

export const getPODetailsForReconcillation: RequestHandler = async (req, res) => {
    try {
        const { poCode } = req.params;

        const buyingOrder = await BuyingOrder.findOne({
            where: { poCode }, include: [
                {
                    model: Vendor,
                },
                {
                    model: BOInvoices
                },
                {
                    model: BuyingOrderOther
                }
            ]
        })
        const poRecords = await BuyingOrderRecord.findAll({
            where: { buyingOrderId: buyingOrder?.id },
            attributes: [[Sequelize.col('sku.skuCode'), 'skuCode'], [Sequelize.col('sku.productTitle'), 'productTitle'], [Sequelize.col('sku.category'), 'category'], [Sequelize.col('sku.brand'), 'brand'], [Sequelize.col('sku.colorFamilyColor'), 'colorFamilyColor'], [Sequelize.col('expectedQty'), 'eQty'], 'unitCost', [Sequelize.literal('ROUND((`unitCost` * `gst`) / 100, 2)'), 'totalGST'], 'gst'],
            include: [
                {
                    model: SKU
                }
            ]
        })

        // const poFile = await File.findOne({ where: { buyingOrderId: buyingOrder?.id } }) || undefined

        // const vendor = await Vendor.findOne({where: {}})


        return res.status(201).json({
            success: true,
            message: `Your details have been fetched`,
            data: { buyingOrder, poRecords },
        });

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> getPODetailsForReconcillation"
            },
        });
    }
}

export const updateGRNData: RequestHandler = async (req, res) => {
    try {
        const { comment, otherFields } = req.body;
        const { poCode } = req.params;

        let otherFieldsArray = otherFields ? JSON.parse(otherFields) : [];

        // Update BuyingOrder with grnComment
        await BuyingOrder.update(
            { grnComment: comment },
            { where: { poCode } }
        );

        // Retrieve the updated BuyingOrder
        const buyingOrder = await BuyingOrder.findOne({
            where: { poCode }
        });

        const oldOtherFields = await BuyingOrderOther.findAll({
            where: {
                buyingOrderId: buyingOrder?.id
            }
        })
        await Promise.all(
            oldOtherFields.filter(
                (oldOtherField) =>
                    !otherFieldsArray.some(
                        (newOtherField: any) => newOtherField.key === oldOtherField.otherKey
                    )
            ).map(async (otherField) => {
                await BuyingOrderOther.destroy({
                    where: {
                        otherKey: otherField.otherKey,
                        buyingOrderId: buyingOrder?.id
                    }
                })
            })
        )

        // Use Promise.all to wait for all the create operations to complete
        const updatedOtherFieldsArray = await Promise.all(
            otherFieldsArray.map(async (otherFieldData: any) => {
                let otherField = oldOtherFields.find(oldOtherField => oldOtherField.otherKey === otherFieldData.key)
                if (otherField) {
                    await BuyingOrderOther.update({
                        otherValue: otherFieldData.value
                    }, {
                        where: {
                            otherKey: otherFieldData.key,
                            buyingOrderId: buyingOrder?.id
                        }
                    })
                }
                else
                    otherField = await BuyingOrderOther.create({
                        otherKey: otherFieldData.key,
                        otherValue: otherFieldData.value,
                        buyingOrderId: buyingOrder?.id,
                    });
                return {
                    ...otherFieldData,
                    id: otherField.id,
                };
            })
        );

        // Return success response with updated other fields
        return res.status(201).json({
            success: true,
            message: 'GRN Data updated successfully',
            data: {
                otherFields: updatedOtherFieldsArray,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconciliation.controller.js -> updateGRNData",
            },
        });
    }
};

export const newInvoice: RequestHandler = async (req, res) => {
    try {
        const { poId } = req.params;
        const { invoiceAtt } = req.body;
        const boInvoice = await BOInvoices.create({
            buyingOrderId: poId
        })

        const decodedInvoiceAtt = Buffer.from(invoiceAtt.buffer, 'base64');

        await File.create({
            fileName: invoiceAtt.originalname,
            fileContent: decodedInvoiceAtt,
            fileType: 'invoiceAtt',
            invoiceAttId: boInvoice.id
        })

        await BuyingOrder.update({
            closed: true
        }, {
            where: { id: poId }
        })

        return res.status(201).json({
            success: true,
            message: 'Invoice successfully added',
        })
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> newInvoice"
            },
        });
    }
}

export const updateInvoice: RequestHandler = async (req, res) => {
    try {
        const { invoiceAtt } = req.body;
        const { invoiceId } = req.params

        const decodedInvoiceAtt = Buffer.from(invoiceAtt.buffer, 'base64');

        await File.update({
            fileName: invoiceAtt.originalname,
            fileContent: decodedInvoiceAtt
        }, {
            where: {
                fileType: 'invoiceAtt',
                invoiceAttId: invoiceId
            }
        })

        return res.status(201).json({
            success: true,
            message: 'Invoice successfully updated',
        })
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> updateInvoice"
            },
        });
    }
}

export const deleteInvoice: RequestHandler = async (req, res) => {
    try {
        const { invoiceId } = req.params

        await File.destroy({
            where: {
                fileType: 'invoiceAtt',
                invoiceAttId: invoiceId
            }
        })

        await BOInvoices.destroy({
            where: {
                id: invoiceId
            }
        })

        return res.status(201).json({
            success: true,
            message: 'Invoice successfully deleted',
        })
    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "reconcillation.controller.js -> updateInvoice"
            },
        });
    }
}