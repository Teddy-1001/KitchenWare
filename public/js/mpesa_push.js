import axios from "axios";
import getAccessToken from "./mpesaAccessToken.js";

const getTimestamp = () => {
    const date = new Date();
    return (
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2)
    );
};

export const stkPush = async (phone, amount, orderId) => {
    const token = await getAccessToken()
    const timestamp = getTimestamp()
    const password = Buffer.from(
        process.env.DARAJA_SHORTCODE +
        process.env.DARAJA_PASSKEY +
        timestamp
    ).toString("base64")
    const payload = {
        BusinessShortCode: process.env.DARAJA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.DARAJA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `https://kitchen-ware.vercel.app/mpesa/callback`,
        AccountReference: `ORDER_${orderId}`,
        TransactionDesc: "KitchenWare Order Payment"

    }
    console.log(payload);
    const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );
    console.log(response.data)
    return response.data

}