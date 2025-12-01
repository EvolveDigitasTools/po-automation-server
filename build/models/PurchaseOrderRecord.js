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
const SKU_1 = __importDefault(require("./sku/SKU"));
const PurchaseOrder_1 = __importDefault(require("./PurchaseOrder"));
let PurchaseOrderRecord = class PurchaseOrderRecord extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], PurchaseOrderRecord.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], PurchaseOrderRecord.prototype, "expectedQty", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2) })
], PurchaseOrderRecord.prototype, "unitCost", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(5, 2) })
], PurchaseOrderRecord.prototype, "gst", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], PurchaseOrderRecord.prototype, "receivedQty", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], PurchaseOrderRecord.prototype, "damaged", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => SKU_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], PurchaseOrderRecord.prototype, "skuId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => PurchaseOrder_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], PurchaseOrderRecord.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => SKU_1.default)
], PurchaseOrderRecord.prototype, "sku", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => PurchaseOrder_1.default)
], PurchaseOrderRecord.prototype, "purchaseOrder", void 0);
PurchaseOrderRecord = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'purchase_order_record',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'false'
    })
], PurchaseOrderRecord);
exports.default = PurchaseOrderRecord;
