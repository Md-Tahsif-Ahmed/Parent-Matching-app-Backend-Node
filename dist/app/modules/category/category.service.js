"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const category_model_1 = require("./category.model");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const createCategoryToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image } = payload;
    const isExistName = yield category_model_1.Category.findOne({ name: name });
    if (isExistName) {
        (0, unlinkFile_1.default)(image);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_ACCEPTABLE, "This Category Name Already Exist");
    }
    const createCategory = yield category_model_1.Category.create(payload);
    if (!createCategory) {
        (0, unlinkFile_1.default)(image);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Category');
    }
    return createCategory;
});
const getCategoriesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_model_1.Category.find({});
    return result;
});
const updateCategoryToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistCategory = yield category_model_1.Category.findById(id);
    if (!isExistCategory) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist");
    }
    if (payload.image) {
        (0, unlinkFile_1.default)(isExistCategory === null || isExistCategory === void 0 ? void 0 : isExistCategory.image);
    }
    const updateCategory = yield category_model_1.Category.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateCategory;
});
const deleteCategoryToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteCategory = yield category_model_1.Category.findByIdAndDelete(id);
    if (!deleteCategory) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Category doesn't exist");
    }
    return deleteCategory;
});
exports.CategoryService = {
    createCategoryToDB,
    getCategoriesFromDB,
    updateCategoryToDB,
    deleteCategoryToDB
};
