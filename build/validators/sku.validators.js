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
exports.validateNew = void 0;
const joi_1 = __importDefault(require("joi"));
const validateNew = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSkuSchema = joi_1.default.object({
            skuCode: joi_1.default.string().required(),
            category: joi_1.default.string(),
            brand: joi_1.default.string(),
            productTitle: joi_1.default.string(),
            hsn: joi_1.default.string(),
            ean: joi_1.default.string(),
            modelNumber: joi_1.default.string(),
            size: joi_1.default.string(),
            colorFamilyColor: joi_1.default.string(),
            productLengthCm: joi_1.default.number().min(0),
            productBreadthCm: joi_1.default.number().min(0),
            productHeightCm: joi_1.default.number().min(0),
            productWeightKg: joi_1.default.number().min(0),
            masterCartonQty: joi_1.default.number().integer().min(0),
            masterCartonLengthCm: joi_1.default.number().min(0),
            masterCartonBreadthCm: joi_1.default.number().min(0),
            masterCartonHeightCm: joi_1.default.number().min(0),
            masterCartonWeightKg: joi_1.default.number().min(0),
            MRP: joi_1.default.number().min(0),
            vendorCode: joi_1.default.string()
        });
        const value = yield newSkuSchema.validateAsync(req.body);
        next();
    }
    catch (error) {
        return res.status(504).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
});
exports.validateNew = validateNew;
// export const validateSignUp: RequestHandler = async (req, res, next) => {
//     try {
//         const signUpSchema = Joi.object({
//             email: Joi.string()
//                 .email()
//                 .required(),
//             password: Joi.string()
//                 .min(8)
//                 .max(20)
//                 .required()
//         })
//         const value = await signUpSchema.validateAsync(req.body);
//         const { email } = value;
//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User with this email already exists!",
//                 data: [],
//             });
//         }
//         next();
//     } catch (error: any) {
//         return res.status(504).json({
//             success: false,
//             message: error.message,
//             data: [],
//         });
//     }
// }