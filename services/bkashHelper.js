import axios from "axios";
import { bkashConfig } from "../config/bkashConfig.js";

let token = null;
let tokenExpiry = null;

const getToken = async () => {
  if (token && tokenExpiry && new Date() < tokenExpiry) {
    return token;
  }

  try {
    const response = await axios.post(
      `${bkashConfig.baseUrl}/tokenized/checkout/token/grant`,
      {
        app_key: bkashConfig.appKey,
        app_secret: bkashConfig.appSecret,
      },
      {
        headers: {
          username: bkashConfig.username,
          password: bkashConfig.password,
        },
      }
    );

    token = response.data.id_token;
    tokenExpiry = new Date(Date.now() + 45 * 60 * 1000); // Token valid for 45 minutes
    return token;
  } catch (error) {
    throw new Error("Failed to get bKash token: " + error.message);
  }
};

export const createPayment = async (orderId, amount) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${bkashConfig.baseUrl}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: orderId,
        callbackURL: bkashConfig.callbackUrl,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: orderId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-APP-Key": bkashConfig.appKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to create bKash payment: " + error.message);
  }
};

export const verifyPayment = async (paymentID) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${bkashConfig.baseUrl}/tokenized/checkout/execute`,
      {
        paymentID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-APP-Key": bkashConfig.appKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to verify bKash payment: " + error.message);
  }
};
