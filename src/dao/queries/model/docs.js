const mongoose = require('mongoose');

const docsSchema = new mongoose.Schema({
    userId: {
        type: String,
        allowNull: true,
        // required: [true, 'Please add a serviceId.'],
    },
    count: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
    },
    data: {
        type: Object,
    },
},
);

//we need to create collection
const Docs = mongoose.model('Docs', docsSchema);

module.exports = Docs;