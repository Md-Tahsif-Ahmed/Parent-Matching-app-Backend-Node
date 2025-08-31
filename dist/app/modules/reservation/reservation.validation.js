"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidationValidation = void 0;
const zod_1 = require("zod");
const checkObjectIdZodSchemaHelper_1 = require("../../../helpers/checkObjectIdZodSchemaHelper");
const createReservationZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        barber: (0, checkObjectIdZodSchemaHelper_1.objectIdZodSchema)("Barber Object Id"),
        service: (0, checkObjectIdZodSchemaHelper_1.objectIdZodSchema)("Service Object Id"),
        price: zod_1.z.number({ required_error: 'PRice is required' })
    })
});
exports.ReviewValidationValidation = {
    createReservationZodSchema
};
