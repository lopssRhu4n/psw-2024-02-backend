const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

// Define your regular expressions
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // CPF format: 111.111.111-11

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        minlength: [15, "Name must be at least 15 characters."],
        maxlength: [50, "Name must be at most 50 characters."],
    },
    cpf: {
        type: String,
        required: [true, "CPF is required."],
        unique: true,
        match: [cpfRegex, "CPF must be in the format 111.111.111-11."],
    },
    img: {
        type: String,
    }
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model("User", UserSchema);
