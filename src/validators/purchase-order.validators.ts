import { RequestHandler } from "express";
import Joi from "joi";
import PurchaseOrder from "../models/PurchaseOrder";

export const validateNew: RequestHandler = async (req, res, next) => {
    try {
        const newPurchaseOrderSchema = Joi.object({
            poCode: Joi.string().required(),
            poType: Joi.string().required(),
            currency: Joi.string().required(),
            paymentTerms: Joi.string(),
            estimatedDeliveryDate: Joi.string(),
            records: Joi.any().required(),
            vendorCode: Joi.string(),
            createdBy: Joi.string().email().required()
        });
        
        await newPurchaseOrderSchema.validateAsync(req.body, {
            abortEarly: false,
        });

        return next();

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

export const validateReview: RequestHandler = async (req, res, next) => {
    try {
        const validateVendorCode = Joi.object({
            poCode: Joi.string().required(),
            isValid: Joi.boolean().required(),
            reason: Joi.string()
        });

        const value = await validateVendorCode.validateAsync(req.body);
        const poCode = value.poCode;
        const buyingOrder = await PurchaseOrder.findOne({ where: { poCode } })
        if (buyingOrder)
            next();
        else {
            return res.status(404).json({
                success: false,
                message: "Buying Order with this po code doesn't exists",
                data: {}
            })
        }

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

export const validatePOCode: RequestHandler = async (req, res, next) => {
    try {
        const validatePOCode = Joi.object({
            poCode: Joi.string().required()
        });

        const value = await validatePOCode.validateAsync(req.params);
        const poCode = value.poCode;
        const purchaseOrder = await PurchaseOrder.findOne({ where: { poCode } })
        if (purchaseOrder)
            next();
        else {
            return res.status(404).json({
                success: false,
                message: "Purchase Order with this po code doesn't exists",
                data: {}
            })
        }

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}

export const validatePOId: RequestHandler = async (req, res, next) => {
    try {
        const validatePOCode = Joi.object({
            poId: Joi.number().required()
        });

        const { poId } = await validatePOCode.validateAsync(req.params);
        const buyingOrder = await PurchaseOrder.findOne({ where: { id: poId } })
        if (buyingOrder)
            next();
        else {
            return res.status(404).json({
                success: false,
                message: "Buying Order with this po id doesn't exists",
                data: {}
            })
        }

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
}