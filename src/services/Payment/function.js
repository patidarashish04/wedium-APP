const axios = require('axios');

const createPaymentOrder = async (paymentData) => {
    try {
        const response = await axios.post('https://app.misscallpay.com/api/create_order', {
           ...paymentData
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
};
const checkOrderStatus = async (paymentStatus) => {
    try {
        const response = await axios.post('https://app.misscallpay.com/api/check_order_status', {
           ...paymentStatus
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
};

module.exports = {
    createPaymentOrder,
    checkOrderStatus
};
