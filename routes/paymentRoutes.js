import express from "express";
import {
  initiatePayment,
  handlePaymentCallback,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/:orderId/initiate", initiatePayment);
router.post("/callback", handlePaymentCallback);

export default router;
