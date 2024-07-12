const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    client_txn_id: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    p_info: {
        type: String,
        required: true,
    },
    customer_name: {
        type: String,
        required: true,
    },
    customer_email: {
        type: String,
        required: true,
    },
    customer_mobile: {
        type: String,
        required: true,
    },
    redirect_url: {
        type: String,
        required: true,
    },
    udf1: {
        type: String,
    },
    udf2: {
        type: String,
    },
    udf3: {
        type: String,
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
    },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
