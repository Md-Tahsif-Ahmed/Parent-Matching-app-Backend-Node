import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JourneyService } from './joureny.service';
 

const createJourney = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await JourneyService.createJourneyToDB(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Journey Created Successfully',
    data: result,
  });
});

const updateJourney = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await JourneyService.updateJourneyToDB(id, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Journey Updated Successfully',
    data: result,
  });
});

const deleteJourney = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  await JourneyService.deleteJourneyToDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Journey Deleted Successfully',
    data: null,
  });
});

const getJourneys = catchAsync(async (req: Request, res: Response) => {
  const result = await JourneyService.journeysFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Journeys Retrieved Successfully',
    data: result,
  });
});

export const JourneyController = {
  createJourney,
  updateJourney,
  deleteJourney,
  getJourneys,
};
