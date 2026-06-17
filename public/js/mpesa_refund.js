import axios from "axios";
import getAccessToken from "./mpesaAccessToken.js";
import { randomBytes } from "crypto";

const getBaseUrl = () =>
    process.env.APP_BASE_URL || "https://kitchen-ware.vercel.app";

const formatPhone = (phone) => {
    if (!phone) return phone;
    let cleaned = String(phone).replace(/\s+/g, "");
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
    return cleaned;
};

export const refundPayment = async (phone, amount, orderId) => {
    const token = await getAccessToken();
    if (!token) {
        throw new Error("Could not obtain M-Pesa access token");
    }

    const partyB = formatPhone(phone);
    if (!partyB) {
        throw new Error("Customer phone number is required for refund");
    }

    const originatorConversationID =
        `KitchenWare_${orderId}_${randomBytes(6).toString("hex")}`;

    const baseUrl = getBaseUrl();

    const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
        {
            OriginatorConversationID: originatorConversationID,
            InitiatorName: process.env.MPESA_INITIATOR,
            SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
            CommandID: "BusinessPayment",
            Amount: Math.round(Number(amount)),
            PartyA: process.env.DARAJA_SHORTCODE,
            PartyB: partyB,
            Remarks: `Refund for order #${orderId}`,
            QueueTimeOutURL: `${baseUrl}/mpesa/refund-timeout`,
            ResultURL: `${baseUrl}/mpesa/refund-result`,
            Occasion: `Order_${orderId}_refund`,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        },
    );

    const data = response.data;

    if (data.ResponseCode && data.ResponseCode !== "0") {
        throw new Error(data.ResponseDescription || "M-Pesa B2C refund request failed");
    }

    return data;
};
