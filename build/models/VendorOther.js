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
const Vendor_1 = __importDefault(require("./Vendor"));
const File_1 = __importDefault(require("./File"));
let VendorOther = class VendorOther extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER
    })
], VendorOther.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    })
], VendorOther.prototype, "otherKey", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    })
], VendorOther.prototype, "otherValue", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => File_1.default)
], VendorOther.prototype, "otherAtt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Vendor_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    })
], VendorOther.prototype, "vendorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Vendor_1.default)
], VendorOther.prototype, "vendor", void 0);
VendorOther = __decorate([
    sequelize_typescript_1.Table
], VendorOther);
exports.default = VendorOther;
