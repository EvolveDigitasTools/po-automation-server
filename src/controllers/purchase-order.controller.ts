import { RequestHandler } from "express";
import Vendor from "../models/vendor/Vendor";
import BuyingOrder from "../models/PurchaseOrder";
import SKU from "../models/sku/SKU";
import File from "../models/File";
import { sendMailSetup } from "../utils/mail.service";
import PurchaseOrder from "../models/PurchaseOrder";
import PurchaseOrderRecord from "../models/PurchaseOrderRecord";
import VendorProfile from "../models/vendor/VendorProfile";
import connection from "../db/connection";
import SKUDetails from "../models/sku/SKUDetails";

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

export const newPurchaseOrder: RequestHandler = async (req, res) => {
  const transaction = await connection.transaction();

  try {
    console.log("🔥 PO CREATE STARTED");
    console.log("📦 Body keys:", Object.keys(req.body));
     console.log("📎 Files:", req.files || req.file);

    const {
      poCode,
      poType = "Fresh",
      currency,
      paymentTerms,
      estimatedDeliveryDate,
      records,
      vendorCode,
      createdBy,
    } = req.body;

    /* ===================== BASIC VALIDATION ===================== */
    if (!poCode || !vendorCode || !createdBy || !records) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!["Fresh", "LSL"].includes(poType)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid PO type",
      });
    }

    /* ===================== VENDOR ===================== */
    const vendor = await Vendor.findOne({
      where: { vendorCode },
      transaction,
    });

    if (!vendor) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const vendorProfile = await VendorProfile.findOne({
      where: { vendorId: vendor.id },
      transaction,
    });

    if (!vendorProfile) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    console.log("✅ Vendor & profile found");

    /* ===================== CREATE PO ===================== */
    const purchaseOrder = await PurchaseOrder.create(
      {
        poCode,
        poType,
        currency,
        paymentTerms,
        estimatedDeliveryDate,
        createdBy,
        verificationLevel: "Buyer",
        vendorProfileId: vendorProfile.id,
        closed: false, 
      },
      { transaction }
    );

    console.log("✅ PurchaseOrder created:", purchaseOrder.id);

    /* ===================== PARSE RECORDS ===================== */
    let orderRecords: any[] = [];

    try {
      orderRecords = JSON.parse(records);
    } catch {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid records JSON",
      });
    }

    if (!Array.isArray(orderRecords) || orderRecords.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "No PO records found",
      });
    }

    console.log("📦 Records count:", orderRecords.length);

    /* ===================== FETCH SKUS ===================== */
    const skuCodes = orderRecords.map((r) => String(r.skuCode).trim());

    const skus = await SKU.findAll({
      where: { skuCode: skuCodes },
      transaction,
    });

    const skuMap = new Map(skus.map((s) => [s.skuCode, s]));

    /* ===================== PREPARE PO RECORDS ===================== */
    const purchaseRecordsData: any[] = [];

    for (const record of orderRecords) {
      const skuCode = String(record.skuCode).trim();
      const sku = skuMap.get(skuCode);

      if (!sku) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `SKU not found: ${skuCode}`,
        });
      }

      /* ===== SAFE UPSERT SKU DETAILS ===== */
      await SKUDetails.upsert(
        {
          skuId: sku.id,
          gst: record.gst,
          mrp: record.mrp,
          createdBy,
        },
        { transaction }
      );

       /* ===================== Shelf Life % ===================== */
      const rawShelfLife =
        record.shelfLifePercent ?? record.shelfLifePercentage;

        let shelfLifePercent = null;

        if (rawShelfLife !== undefined && rawShelfLife !== null && rawShelfLife !== "") {
        const value = Number(rawShelfLife);
        if (isNaN(value) || value < 0 || value > 100) {
        await transaction.rollback();
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
    await PurchaseOrderRecord.bulkCreate(purchaseRecordsData, {
      transaction,
    });

    console.log("✅ PurchaseOrderRecords created");

    /* ===================== COMMIT ===================== */
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        poType === "LSL"
          ? "LSL Master PO created successfully"
          : "Purchase Order created successfully",
      data: {
        poId: purchaseOrder.id,
        poCode: purchaseOrder.poCode,
        poType: purchaseOrder.poType,
      },
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ PO CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create purchase order",
    });
  }
};

export const getUniquePOCodeRoute: RequestHandler = async (req, res) => {
    try {
        const poCode = await getUniquePOCode();

        return res.status(201).json({
            success: true,
            message: `Your POCode has been created`,
            data: { poCode },
        });

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "buying-order.controller.js -> getUniquePOCodeRoute"
            },
        });
    }
};

export const applyReview: RequestHandler = async (req, res) => {
    try {
        const { poCode, isValid, reason } = req.body;

        const buyingOrder = await BuyingOrder.findOne({ where: { poCode } })

        const poFile = await File.findOne({ where: { buyingOrderId: buyingOrder?.id } }) || undefined

        if (isValid == "true") {
            if (buyingOrder?.verificationLevel == "Buyer") {
                await sendMailSetup(buyingOrder?.poCode, 'account-approval', undefined, undefined, poFile);
                await BuyingOrder.update(
                    { verificationLevel: 'Accounts' },
                    { where: { poCode } }
                );
            }
            else if (buyingOrder?.verificationLevel == "Accounts") {
                await sendMailSetup(buyingOrder?.poCode, 'bu-approval', undefined, undefined, poFile);
                await BuyingOrder.update(
                    { verificationLevel: 'BOHead' },
                    { where: { poCode } }
                );
            }
            else if (buyingOrder?.verificationLevel == "BOHead") {
                await sendMailSetup(null, 'po-success', undefined, buyingOrder?.createdBy)
                await BuyingOrder.update(
                    { isVerified: true },
                    { where: { poCode } }
                );
            }

        }
        else {
            const variables = {
                denyReason: reason
            }
            await sendMailSetup(null, 'po-fail', variables, buyingOrder?.createdBy)
            await BuyingOrder.destroy({ where: { isVerified: false, poCode } })
        }


        return res.status(201).json({
            success: true,
            message: `Your review is done`,
            data: {},
        });

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "sku.controller.js -> applyReview"
            },
        });
    }

}

export const getPODetails: RequestHandler = async (req, res) => {
    try {
        const { poCode } = req.params;

        const purchaseOrder = await PurchaseOrder.findOne({
            where: { poCode }, include: [
                {
                    model: PurchaseOrderRecord,
                    include: [
                        {
                            model: SKU
                        }
                    ]
                }
            ]
        })

        return res.status(200).json({
            success: true,
            message: `Your details have been fetched`,
            data: {
                records: purchaseOrder?.records?.map((record) => {
                    return {
                        expectedQty: record.expectedQty,
                        skuCode: record.sku?.skuCode,
                        name: record.sku?.name
                    }
                })
            },
        });

    } catch (error: any) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: {
                "source": "purchase-order.controller.js -> getPODetails"
            },
        });
    }
}

export const validateSKUs: RequestHandler = async (req, res) => {
  const skuCodes = req.body?.skuCodes;

  if (!Array.isArray(skuCodes) || skuCodes.length === 0) {
    return res.status(400).json({
      success: false,
      message: "skuCodes array required",
    });
  }

  const existingSKUs = await SKU.findAll({
    where: { skuCode: skuCodes },
    attributes: ["skuCode"],
  });

  const existingSet = new Set(existingSKUs.map(s => s.skuCode));
  const missingSKUs = skuCodes.filter(code => !existingSet.has(code));

  return res.json({
    success: true,
    missingSKUs,
  });
};


const getUniquePOCode = async () => {
    let poCode, existingPO
    do {
        poCode = `PO-${Math.floor(1000 + Math.random() * 9000)}`
        existingPO = await BuyingOrder.findOne({
            where: {
                poCode,
            },
        });
    } while (existingPO)
    return poCode
}