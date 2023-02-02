const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const users = new Schema(
    {
        username: {type: String, required: true, trim: true,},
        email: {type: String, required: true, trim: true,},
        password: {type: String, required: true,trim: true,},
    },
    {
        timestamps: true,
    },
);

const user = mongoose.model('users', users);
module.exports = user;   