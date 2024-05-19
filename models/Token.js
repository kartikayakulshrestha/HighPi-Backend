const mongoose = require("mongoose");
const User = require("./users")

const tokenSchema = new mongoose.Schema({
	userId: {
        type:String,
		required: true,
		ref: User,
		unique: true,
	},
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = mongoose.model("token", tokenSchema);