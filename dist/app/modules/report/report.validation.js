"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportValidation = void 0;
const zod_1 = require("zod");
const checkObjectIdZodSchemaHelper_1 = require("../../../helpers/checkObjectIdZodSchemaHelper");
const createReportZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        customer: (0, checkObjectIdZodSchemaHelper_1.objectIdZodSchema)("Customer Object Id is required"),
        service: (0, checkObjectIdZodSchemaHelper_1.objectIdZodSchema)("Service Object Id is required"),
        reason: zod_1.z.array(zod_1.z.string({ required_error: 'Reason is required' }))
    })
});
exports.ReportValidation = { createReportZodSchema };
