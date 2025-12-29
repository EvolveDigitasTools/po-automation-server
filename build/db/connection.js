"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Vendor_1 = __importDefault(require("../models/vendor/Vendor"));
const Attachment_1 = __importDefault(require("../models/attachment/Attachment"));
const AttachmentChunk_1 = __importDefault(require("../models/attachment/AttachmentChunk"));
const AttachmentMapping_1 = __importDefault(require("../models/attachment/AttachmentMapping"));
const ContactPerson_1 = __importDefault(require("../models/vendor/ContactPerson"));
const VendorAddress_1 = __importDefault(require("../models/vendor/VendorAddress"));
const VendorBank_1 = __importDefault(require("../models/vendor/VendorBank"));
const VendorOther_1 = __importDefault(require("../models/vendor/VendorOther"));
const VendorAttachments_1 = __importDefault(require("../models/vendor/VendorAttachments"));
const VendorProfile_1 = __importDefault(require("../models/vendor/VendorProfile"));
const SKU_1 = __importDefault(require("../models/sku/SKU"));
const SKUDetails_1 = __importDefault(require("../models/sku/SKUDetails"));
const SKUDimensions_1 = __importDefault(require("../models/sku/SKUDimensions"));
const Comment_1 = __importDefault(require("../models/Comment"));
const mysql = __importStar(require("mysql2"));
const Inventory_1 = __importDefault(require("../models/sku/Inventory"));
const PurchaseOrder_1 = __importDefault(require("../models/PurchaseOrder"));
const PurchaseOrderRecord_1 = __importDefault(require("../models/PurchaseOrderRecord"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const PurchaseOrderGRN_1 = __importDefault(require("../models/PurchaseOrderGRN"));
const connection = new sequelize_typescript_1.Sequelize({
    dialect: "mysql",
    dialectModule: mysql,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // database: 'brand_analytics',
    logging: false,
    port: 3306,
    models: [
        Attachment_1.default,
        AttachmentChunk_1.default,
        AttachmentMapping_1.default,
        Vendor_1.default,
        ContactPerson_1.default,
        VendorAddress_1.default,
        VendorBank_1.default,
        VendorOther_1.default,
        VendorAttachments_1.default,
        VendorProfile_1.default,
        SKU_1.default,
        SKUDetails_1.default,
        SKUDimensions_1.default,
        Comment_1.default,
        Inventory_1.default,
        PurchaseOrder_1.default,
        PurchaseOrderGRN_1.default,
        PurchaseOrderRecord_1.default,
        Invoice_1.default
    ]
});
// connection.sync({ alter: true }); 
exports.default = connection;
