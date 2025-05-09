import { createPayment, verifyPayment } from "../services/bkashHelper.js";
import { Order } from "../models/Order.js";
import { ObjectId } from "mongodb";

export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(new ObjectId(orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "unpaid") {
      return res
        .status(400)
        .json({ message: "Order is already paid or in invalid state" });
    }

    const paymentResponse = await createPayment(orderId, order.subtotal);
    res.status(200).json(paymentResponse);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error initiating payment", error: error.message });
  }
};

export const handlePaymentCallback = async (req, res) => {
  try {
    const { paymentID, status, transactionStatus } = req.body;

    if (status !== "success" || transactionStatus !== "Completed") {
      return res.status(400).json({ message: "Payment failed or incomplete" });
    }

    const paymentDetails = await verifyPayment(paymentID);

    if (paymentDetails.statusCode !== "0000") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const orderId = paymentDetails.merchantInvoiceNumber;
    await Order.updateStatus(new ObjectId(orderId), "paid", paymentID);

    res.status(200).json({ message: "Payment successful", orderId });
  } catch (error) {
    res.status(500).json({
      message: "Error processing payment callback",
      error: error.message,
    });
  }
};
