const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    event: {
        type: mongoose.ObjectId,
        ref: 'Event',
        required: [true, "Event ID is required."],
        immutable: true
    },
    invite: {
        type: mongoose.ObjectId,
        ref: 'Invite',
        required: [true, "Invite ID is required."],
        immutable: true
    },
    user: {
        type: mongoose.ObjectId,
        ref: "User", // Assuming it references a User model
        required: [true, "User ID is required."],
        immutable: true
    },
    rating: {
        type: Number,
        required: [true, "A avaliação é obrigatória."],
        min: [0, "A avaliação deve ser no mínimo 0."],
        max: [5, "A avaliação deve ser no máximo 5."]
    },
    text: {
        type: String,
        required: [true, "O texto é obrigatório."],
        minlength: [8, "O texto deve ter no mínimo 8 caracteres."]
    }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
