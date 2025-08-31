"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });
exports.Banner = (0, mongoose_1.model)("Banner", bannerSchema);
