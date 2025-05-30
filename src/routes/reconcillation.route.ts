import { Router } from "express";
import { getAllPOs, getApprovedPOs, getPODetailsForReconcillation, newInvoice, updateInvoice, updateGRNData, deleteInvoice } from "../controllers/reconcillation.controller";
import { validatePOCode, validatePOId } from "../validators/purchase-order.validators";
import { validateGRNData, validateInvoice, validateInvoiceId,  } from "../validators/reconcillation.validators";

const router = Router();

router.get('/approved-pos', getApprovedPOs)
router.get('/all-pos', getAllPOs)
router.get('/:poCode', validatePOCode, getPODetailsForReconcillation)
router.put('/:poCode', validatePOCode, validateGRNData, updateGRNData)
router.post('/invoice/:poId', validatePOId, validateInvoice, newInvoice)
router.put('/invoice/:invoiceId', validateInvoiceId, validateInvoice, updateInvoice)
router.delete('/invoice/:invoiceId', validateInvoiceId, deleteInvoice)

export default router;