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
const BuyingOrderRecord_1 = __importDefault(require("./BuyingOrderRecord"));
const Vendor_1 = __importDefault(require("./Vendor"));
const Comment_1 = __importDefault(require("./Comment"));
const File_1 = __importDefault(require("./File"));
const BOInvoices_1 = __importDefault(require("./BOInvoices"));
const BuyingOrderOther_1 = __importDefault(require("./BuyingOrderOther"));
let BuyingOrder = class BuyingOrder extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], BuyingOrder.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "poCode", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "currency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "paymentTerms", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "estimatedDeliveryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN
    })
], BuyingOrder.prototype, "isVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "verificationLevel", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => File_1.default, { foreignKey: 'buyingOrderId' })
], BuyingOrder.prototype, "poAttachment", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN
    })
], BuyingOrder.prototype, "closed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    })
], BuyingOrder.prototype, "grnComment", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => BOInvoices_1.default)
], BuyingOrder.prototype, "invoiceAtts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => BuyingOrderOther_1.default)
], BuyingOrder.prototype, "otherFields", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => File_1.default, { foreignKey: 'buyingOrderIdPackaging' })
], BuyingOrder.prototype, "packagingAtt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => File_1.default, { foreignKey: 'buyingOrderIdGRNSheet' })
], BuyingOrder.prototype, "grnAtt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => BuyingOrderRecord_1.default)
], BuyingOrder.prototype, "records", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Comment_1.default)
], BuyingOrder.prototype, "comments", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Vendor_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], BuyingOrder.prototype, "vendorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Vendor_1.default)
], BuyingOrder.prototype, "vendor", void 0);
BuyingOrder = __decorate([
    sequelize_typescript_1.Table
], BuyingOrder);
exports.default = BuyingOrder;
