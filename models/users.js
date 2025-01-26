const mongoose = require("mongoose");

// Define your regular expressions
const specialCharRegEx = /[^A-Za-z0-9]/; // At least one special character
const uppercaseRegEx = /[A-Z]/;         // At least one uppercase letter
const lowerCaseRegEx = /[a-z]/;         // At least one lowercase letter
const hasNumberRegEx = /[0-9]/;         // At least one number
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // CPF format: 111.111.111-11

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        minlength: [15, "Name must be at least 15 characters."],
        maxlength: [50, "Name must be at most 50 characters."],
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        validate: [
            {
                validator: (value) => specialCharRegEx.test(value),
                message: "Password must contain at least one special character.",
            },
            {
                validator: (value) => uppercaseRegEx.test(value),
                message: "Password must contain at least one uppercase letter.",
            },
            {
                validator: (value) => lowerCaseRegEx.test(value),
                message: "Password must contain at least one lowercase letter.",
            },
            {
                validator: (value) => hasNumberRegEx.test(value),
                message: "Password must contain at least one number.",
            },
        ],
    },
    cpf: {
        type: String,
        required: [true, "CPF is required."],
        unique: true,
        match: [cpfRegex, "CPF must be in the format 111.111.111-11."],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required."],
        match: [/^\S+@\S+\.\S+$/, "Must be a valid email address."],
    },
    img: {
        type: String,
    }
});

module.exports = mongoose.model("User", UserSchema);
