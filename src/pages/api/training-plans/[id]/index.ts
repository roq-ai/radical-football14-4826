import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { trainingPlanValidationSchema } from 'validationSchema/training-plans';
import { convertQueryToPrismaUtil } from 'server/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getTrainingPlanById();
    case 'PUT':
      return updateTrainingPlanById();
    case 'DELETE':
      return deleteTrainingPlanById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getTrainingPlanById() {
    const data = await prisma.training_plan.findFirst(convertQueryToPrismaUtil(req.query, 'training_plan'));
    return res.status(200).json(data);
  }

  async function updateTrainingPlanById() {
    await trainingPlanValidationSchema.validate(req.body);
    const data = await prisma.training_plan.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });
    return res.status(200).json(data);
  }
  async function deleteTrainingPlanById() {
    const data = await prisma.training_plan.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
