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
// export const newPurchaseOrder: RequestHandler = async (req, res) => {
//     const transaction = await connection.transaction();
//     try {
//         const { poCode, poType, currency, paymentTerms, estimatedDeliveryDate, records, vendorCode, createdBy } = req.body;
//         // Retrieve the vendor and its corresponding profile (1:1 mapping)
//         const vendor = await Vendor.findOne({ where: { vendorCode }, transaction });
//         if (!vendor) {
//             await transaction.rollback();
//             return res.status(404).json({ error: 'Vendor not found' });
//         }
//         const vendorProfile = await VendorProfile.findOne({ where: { vendorId: vendor.id }, transaction });
//         if (!vendorProfile) {
//             await transaction.rollback();
//             return res.status(404).json({ error: 'Vendor Profile not found' });
//         }
//         // Create the Purchase Order with the vendor profile ID
//         const purchaseOrder = await PurchaseOrder.create({
//             poCode,
//             poType,
//             currency,
//             paymentTerms,
//             estimatedDeliveryDate,
//             createdBy,
//             verificationLevel: 'Buyer',
//             vendorProfileId: vendorProfile.id
//         }, { transaction });
//         // Parse the JSON records
//         const orderRecords = JSON.parse(records);
//         // For efficiency, extract all skuCodes from records
//         const skuCodes = orderRecords.map((r: any) => r.skuCode);
//         // Retrieve all matching SKUs in one query
//         const skus = await SKU.findAll({ where: { skuCode: skuCodes }, transaction });
//         const skuMap = new Map(skus.map(sku => [sku.skuCode, sku]));
//         // Prepare data for bulk creation of purchase order records
//         const purchaseRecordsData: Array<{
//             expectedQty: number;
//             unitCost: number;
//             gst: number;
//             purchaseOrderId: number;
//             skuId: number;
//         }> = [];
//         // Process each record: validate SKU, update SKUDetail, and collect record data
//         for (const record of orderRecords) {
//             const sku = skuMap.get(record.skuCode+'');
//             if (!sku) {
//                 await transaction.rollback();
//                 return res.status(404).json({ error: `SKU not found for skuCode: ${record.skuCode}` });
//             }
//             // Update the one-to-one SKUDetail record with gst and mrp values
//             await SKUDetails.update(
//                 { gst: record.gst, mrp: record.mrp },
//                 { where: { skuId: sku.id }, transaction }
//             );
//             // Prepare the purchase order record (adjust field names as necessary)
//             purchaseRecordsData.push({
//                 expectedQty: record.expectedQty,
//                 unitCost: record.unitCost,
//                 gst: record.gst,
//                 purchaseOrderId: purchaseOrder.id,
//                 skuId: sku.id
//             });
//         }
//         // Bulk create purchase order records
//         await PurchaseOrderRecord.bulkCreate(purchaseRecordsData, { transaction });
//         // Commit the transaction if everything passes
//         await transaction.commit();
//         // const mailSent = await sendMailSetup(buyingOrder.poCode, 'buyer-approval', undefined, undefined, poFile);
//         // if (mailSent)
//         return res.status(201).json({
//             success: true,
//             message: `Your Purchase Order has been successfully added`,
//             data: { purchaseOrder },
//         });
//         // else
//         //     return res.status(404).json({
//         //         success: false,
//         //         message: `Unable to send email.`,
//         //         data: {
//         //             mailSent
//         //         }
//         //     })
//     } catch (error: any) {
//         await transaction.rollback();
//         return res.status(504).json({
//             success: false,
//             message: error.message,
//             data: {
//                 "source": "purchase-order.controller.js -> newPurchaseOrder"
//             },
//         });
//     }
// };
const newPurchaseOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const transaction = yield connection_1.default.transaction();
    try {
        console.log("🔥 PO CREATE STARTED");
        console.log("📦 Body keys:", Object.keys(req.body));
        console.log("📎 Files:", req.files || req.file);
        const { poCode, poType = "Fresh", currency, paymentTerms, estimatedDeliveryDate, records, vendorCode, createdBy, } = req.body;
        /* ===================== BASIC VALIDATION ===================== */
        if (!poCode || !vendorCode || !createdBy || !records) {
            yield transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        if (!["Fresh", "LSL"].includes(poType)) {
            yield transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid PO type",
            });
        }
        /* ===================== VENDOR ===================== */
        const vendor = yield Vendor_1.default.findOne({
            where: { vendorCode },
            transaction,
        });
        if (!vendor) {
            yield transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }
        const vendorProfile = yield VendorProfile_1.default.findOne({
            where: { vendorId: vendor.id },
            transaction,
        });
        if (!vendorProfile) {
            yield transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Vendor profile not found",
            });
        }
        console.log("✅ Vendor & profile found");
        /* ===================== CREATE PO ===================== */
        const purchaseOrder = yield PurchaseOrder_2.default.create({
            poCode,
            poType,
            currency,
            paymentTerms,
            estimatedDeliveryDate,
            createdBy,
            verificationLevel: "Buyer",
            vendorProfileId: vendorProfile.id,
            closed: false,
        }, { transaction });
        console.log("✅ PurchaseOrder created:", purchaseOrder.id);
        /* ===================== PARSE RECORDS ===================== */
        let orderRecords = [];
        try {
            orderRecords = JSON.parse(records);
        }
        catch (_b) {
            yield transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid records JSON",
            });
        }
        if (!Array.isArray(orderRecords) || orderRecords.length === 0) {
            yield transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "No PO records found",
            });
        }
        console.log("📦 Records count:", orderRecords.length);
        /* ===================== FETCH SKUS ===================== */
        const skuCodes = orderRecords.map((r) => String(r.skuCode).trim());
        const skus = yield SKU_1.default.findAll({
            where: { skuCode: skuCodes },
            transaction,
        });
        const skuMap = new Map(skus.map((s) => [s.skuCode, s]));
        /* ===================== PREPARE PO RECORDS ===================== */
        const purchaseRecordsData = [];
        for (const record of orderRecords) {
            const skuCode = String(record.skuCode).trim();
            const sku = skuMap.get(skuCode);
            if (!sku) {
                yield transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `SKU not found: ${skuCode}`,
                });
            }
            /* ===== SAFE UPSERT SKU DETAILS ===== */
            yield SKUDetails_1.default.upsert({
                skuId: sku.id,
                gst: record.gst,
                mrp: record.mrp,
                createdBy,
            }, { transaction });
            /* ===================== Shelf Life % ===================== */
            const rawShelfLife = (_a = record.shelfLifePercent) !== null && _a !== void 0 ? _a : record.shelfLifePercentage;
            let shelfLifePercent = null;
            if (rawShelfLife !== undefined && rawShelfLife !== null && rawShelfLife !== "") {
                const value = Number(rawShelfLife);
                if (isNaN(value) || value < 0 || value > 100) {
                    yield transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Invalid Shelf Life % for SKU ${skuCode}`,
                    });
                }
                shelfLifePercent = value;
            }
            purchaseRecordsData.push({
                expectedQty: record.expectedQty,
                shelfLifePercent,
                unitCost: record.unitCost,
                gst: record.gst,
                purchaseOrderId: purchaseOrder.id,
                skuId: sku.id,
                receivedQty: 0,
                damaged: 0,
                grnId: null,
            });
        }
        /* ===================== INSERT RECORDS ===================== */
        yield PurchaseOrderRecord_1.default.bulkCreate(purchaseRecordsData, {
            transaction,
        });
        console.log("✅ PurchaseOrderRecords created");
        /* ===================== COMMIT ===================== */
        yield transaction.commit();
        return res.status(201).json({
            success: true,
            message: poType === "LSL"
                ? "LSL Master PO created successfully"
                : "Purchase Order created successfully",
            data: {
                poId: purchaseOrder.id,
                poCode: purchaseOrder.poCode,
                poType: purchaseOrder.poType,
            },
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.error("❌ PO CREATE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create purchase order",
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
    var _c;
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
                records: (_c = purchaseOrder === null || purchaseOrder === void 0 ? void 0 : purchaseOrder.records) === null || _c === void 0 ? void 0 : _c.map((record) => {
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
