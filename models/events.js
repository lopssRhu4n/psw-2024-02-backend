const mongoose = require("mongoose");
const eventsSchema = mongoose.Schema({
    user: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 30,
    },
    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 255,
    },
    location: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0, // Positive numbers only
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= new Date(); // Must be a future date
            },
            message: "Date must be in the future.",
        },
    },
    start_time: {
        type: String,
        required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        min: 0, // Positive numbers only
    },
    img: {
        type: String,
    },
})

module.exports = mongoose.model('Event', eventsSchema);

