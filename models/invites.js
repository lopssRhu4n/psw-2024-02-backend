const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema({
    sender: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: [true, "Sender ID is required."],
        immutable: true
    },
    event: {
        type: mongoose.ObjectId,
        ref: 'Event',
        required: [true, "Event ID is required."],
        immutable: true
    },
    user: {
        type: mongoose.ObjectId,
        ref: "User", // Assuming it references a User model
        required: [true, "User ID is required."],
        immutable: true
    },
    text: {
        type: String,
        // required: [true, "Text is required."],
        // minlength: [8, "Text must be at least 8 characters long."],
    },
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

const Invite = mongoose.model("Invite", InviteSchema);

module.exports = Invite;
