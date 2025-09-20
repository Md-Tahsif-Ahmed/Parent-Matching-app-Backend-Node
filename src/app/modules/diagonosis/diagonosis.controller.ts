import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DiagnosisService } from './diagonosis.service';
 

const createDiagnosis = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await DiagnosisService.createDiagnosisToDB(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Diagnosis Created Successfully',
    data: result,
  });
});

const updateDiagnosis = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await DiagnosisService.updateDiagnosisToDB(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Diagnosis Updated Successfully',
    data: result,
  });
});

const deleteDiagnosis = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  await DiagnosisService.deleteDiagnosisToDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Diagnosis Deleted Successfully',
    data: null,
  });
});

const getDiagnoses = catchAsync(async (req: Request, res: Response) => {
  const result = await DiagnosisService.diagnosesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Diagnoses Retrieved Successfully',
    data: result,
  });
});

export const DiagnosisController = {
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  getDiagnoses,
};
