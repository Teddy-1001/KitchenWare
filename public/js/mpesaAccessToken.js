import axios from "axios";

const getAccessToken = async () => {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET

    try {
        const encodedCredentials = Buffer
            .from(`${consumerKey}:${consumerSecret}`)
            .toString('base64');
        const headers = {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        };
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            { headers }
        );
        console.log(response.data)
        return response.data.access_token
    } catch (error) {
        console.log(error.response?.data || error.message)
    }
}
export default getAccessToken
