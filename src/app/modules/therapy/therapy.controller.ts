import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TherapyService } from './therapy.service';

const createTherapy = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await TherapyService.createTherapyToDB(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Therapy Created Successfully',
    data: result,
  });
});

const updateTherapy = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await TherapyService.updateTherapyToDB(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Therapy Updated Successfully',
    data: result,
  });
});

const deleteTherapy = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  await TherapyService.deleteTherapyToDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Therapy Deleted Successfully',
    data: null,
  });
});

const getTherapies = catchAsync(async (req: Request, res: Response) => {
  const result = await TherapyService.therapiesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Therapies Retrieved Successfully',
    data: result,
  });
});

export const TherapyController = {
  createTherapy,
  updateTherapy,
  deleteTherapy,
  getTherapies,
};
