"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_codes_1 = require("http-status-codes");
// import { Morgan } from "./shared/morgan";
const routes_1 = __importDefault(require("../src/app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
// morgan
// app.use(Morgan.successHandler);
// app.use(Morgan.errorHandler);
//body parser
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//file retrieve
app.use(express_1.default.static('uploads'));
// Session middleware (must be before passport initialization)
app.use((0, express_session_1.default)({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Secure should be true in production with HTTPS
}));
// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());
//router
app.use('/api/v1', routes_1.default);
app.get("/", (req, res) => {
    res.send("Hey Backend, How can I assist you ");
});
//global error handle
app.use(globalErrorHandler_1.default);
// handle not found route
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST"
            }
        ]
    });
});
exports.default = app;
