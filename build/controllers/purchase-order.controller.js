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
exports.getPODetails = exports.applyReview = exports.getUniquePOCodeRoute = exports.newPurchaseOrder = void 0;
const Vendor_1 = __importDefault(require("../models/vendor/Vendor"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const SKU_1 = __importDefault(require("../models/sku/SKU"));
const File_1 = __importDefault(require("../models/File"));
const mail_service_1 = require("../utils/mail.service");
const PurchaseOrder_2 = __importDefault(require("../models/PurchaseOrder"));
const PurchaseOrderRecord_1 = __importDefault(require("../models/PurchaseOrderRecord"));
const VendorProfile_1 = __importDefault(require("../models/vendor/VendorProfile"));
const connection_1 = __importDefault(require("../db/connection"));
const SKUDetails_1 = __importDefault(require("../models/sku/SKUDetails"));
const newPurchaseOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield connection_1.default.transaction();
    try {
        const { poCode, poType, currency, paymentTerms, estimatedDeliveryDate, records, vendorCode, createdBy } = req.body;
        // Retrieve the vendor and its corresponding profile (1:1 mapping)
        const vendor = yield Vendor_1.default.findOne({ where: { vendorCode }, transaction });
        if (!vendor) {
            yield transaction.rollback();
            return res.status(404).json({ error: 'Vendor not found' });
        }
        const vendorProfile = yield VendorProfile_1.default.findOne({ where: { vendorId: vendor.id }, transaction });
        if (!vendorProfile) {
            yield transaction.rollback();
            return res.status(404).json({ error: 'Vendor Profile not found' });
        }
        // Create the Purchase Order with the vendor profile ID
        const purchaseOrder = yield PurchaseOrder_2.default.create({
            poCode,
            poType,
            currency,
            paymentTerms,
            estimatedDeliveryDate,
            createdBy,
            verificationLevel: 'Buyer',
            vendorProfileId: vendorProfile.id
        }, { transaction });
        // Parse the JSON records
        const orderRecords = JSON.parse(records);
        // For efficiency, extract all skuCodes from records
        const skuCodes = orderRecords.map((r) => r.skuCode);
        // Retrieve all matching SKUs in one query
        const skus = yield SKU_1.default.findAll({ where: { skuCode: skuCodes }, transaction });
        const skuMap = new Map(skus.map(sku => [sku.skuCode, sku]));
        // Prepare data for bulk creation of purchase order records
        const purchaseRecordsData = [];
        // Process each record: validate SKU, update SKUDetail, and collect record data
        for (const record of orderRecords) {
            const sku = skuMap.get(record.skuCode + '');
            if (!sku) {
                yield transaction.rollback();
                return res.status(404).json({ error: `SKU not found for skuCode: ${record.skuCode}` });
            }
            // Update the one-to-one SKUDetail record with gst and mrp values
            yield SKUDetails_1.default.update({ gst: record.gst, mrp: record.mrp }, { where: { skuId: sku.id }, transaction });
            // Prepare the purchase order record (adjust field names as necessary)
            purchaseRecordsData.push({
                expectedQty: record.expectedQty,
                unitCost: record.unitCost,
                gst: record.gst,
                purchaseOrderId: purchaseOrder.id,
                skuId: sku.id
            });
        }
        // Bulk create purchase order records
        yield PurchaseOrderRecord_1.default.bulkCreate(purchaseRecordsData, { transaction });
        // Commit the transaction if everything passes
        yield transaction.commit();
        // const mailSent = await sendMailSetup(buyingOrder.poCode, 'buyer-approval', undefined, undefined, poFile);
        // if (mailSent)
        return res.status(201).json({
            success: true,
            message: `Your Purchase Order has been successfully added`,
            data: { purchaseOrder },
        });
        // else
        //     return res.status(404).json({
        //         success: false,
        //         message: `Unable to send email.`,
        //         data: {
        //             mailSent
        //         }
        //     })
    }
    catch (error) {
        yield transaction.rollback();
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "purchase-order.controller.js -> newPurchaseOrder"
            },
        });
    }
});
exports.newPurchaseOrder = newPurchaseOrder;
const getUniquePOCodeRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poCode = yield getUniquePOCode();
        return res.status(201).json({
            success: true,
            message: `Your POCode has been created`,
            data: { poCode },
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "buying-order.controller.js -> getUniquePOCodeRoute"
            },
        });
    }
});
exports.getUniquePOCodeRoute = getUniquePOCodeRoute;
const applyReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { poCode, isValid, reason } = req.body;
        const buyingOrder = yield PurchaseOrder_1.default.findOne({ where: { poCode } });
        const poFile = (yield File_1.default.findOne({ where: { buyingOrderId: buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.id } })) || undefined;
        if (isValid == "true") {
            if ((buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.verificationLevel) == "Buyer") {
                yield (0, mail_service_1.sendMailSetup)(buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.poCode, 'account-approval', undefined, undefined, poFile);
                yield PurchaseOrder_1.default.update({ verificationLevel: 'Accounts' }, { where: { poCode } });
            }
            else if ((buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.verificationLevel) == "Accounts") {
                yield (0, mail_service_1.sendMailSetup)(buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.poCode, 'bu-approval', undefined, undefined, poFile);
                yield PurchaseOrder_1.default.update({ verificationLevel: 'BOHead' }, { where: { poCode } });
            }
            else if ((buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.verificationLevel) == "BOHead") {
                yield (0, mail_service_1.sendMailSetup)(null, 'po-success', undefined, buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.createdBy);
                yield PurchaseOrder_1.default.update({ isVerified: true }, { where: { poCode } });
            }
        }
        else {
            const variables = {
                denyReason: reason
            };
            yield (0, mail_service_1.sendMailSetup)(null, 'po-fail', variables, buyingOrder === null || buyingOrder === void 0 ? void 0 : buyingOrder.createdBy);
            yield PurchaseOrder_1.default.destroy({ where: { isVerified: false, poCode } });
        }
        return res.status(201).json({
            success: true,
            message: `Your review is done`,
            data: {},
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "sku.controller.js -> applyReview"
            },
        });
    }
});
exports.applyReview = applyReview;
const getPODetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { poCode } = req.params;
        const purchaseOrder = yield PurchaseOrder_2.default.findOne({
            where: { poCode }, include: [
                {
                    model: PurchaseOrderRecord_1.default,
                    include: [
                        {
                            model: SKU_1.default
                        }
                    ]
                }
            ]
        });
        return res.status(200).json({
            success: true,
            message: `Your details have been fetched`,
            data: {
                records: (_a = purchaseOrder === null || purchaseOrder === void 0 ? void 0 : purchaseOrder.records) === null || _a === void 0 ? void 0 : _a.map((record) => {
                    var _a, _b;
                    return {
                        expectedQty: record.expectedQty,
                        skuCode: (_a = record.sku) === null || _a === void 0 ? void 0 : _a.skuCode,
                        name: (_b = record.sku) === null || _b === void 0 ? void 0 : _b.name
                    };
                })
            },
        });
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "purchase-order.controller.js -> getPODetails"
            },
        });
    }
});
exports.getPODetails = getPODetails;
const getUniquePOCode = () => __awaiter(void 0, void 0, void 0, function* () {
    let poCode, existingPO;
    do {
        poCode = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
        existingPO = yield PurchaseOrder_1.default.findOne({
            where: {
                poCode,
            },
        });
    } while (existingPO);
    return poCode;
});
