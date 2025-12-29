"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const PurchaseOrder_1 = __importDefault(require("./PurchaseOrder"));
let PurchaseOrderGRN = class PurchaseOrderGRN extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
], PurchaseOrderGRN.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PurchaseOrder_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    })
], PurchaseOrderGRN.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    })
], PurchaseOrderGRN.prototype, "invoiceNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        allowNull: true,
    })
], PurchaseOrderGRN.prototype, "invoiceDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    })
], PurchaseOrderGRN.prototype, "receivedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    })
], PurchaseOrderGRN.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PurchaseOrder_1.default)
], PurchaseOrderGRN.prototype, "purchaseOrder", void 0);
PurchaseOrderGRN = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "purchase_order_grn",
        timestamps: false,
    })
], PurchaseOrderGRN);
exports.default = PurchaseOrderGRN;
