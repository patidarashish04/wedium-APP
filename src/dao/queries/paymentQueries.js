const axios = require('axios');
const Payment = require('./model/payment');

const createPaymentOrder = async (paymentData) => {
    const payment = new Payment(paymentData);
    await payment.save();

    const response = await axios.post('https://app.misscallpay.com/api/create_order', {
        ...paymentData
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    payment.status = response.data.status ? 'PENDING' : 'FAILED';
    await payment.save();

    return response.data;
};

const checkOrderStatus = async (paymentStatus) => {
    const payment = new Payment(paymentStatus);
    await payment.save();

    const response = await axios.post('https://app.misscallpay.com/api/check_order_status', {
        ...paymentStatus
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    payment.status = response.data.status ? 'PENDING' : 'FAILED';
    await payment.save();

    return response.data;
};

module.exports = {
    createPaymentOrder,
    checkOrderStatus
};
