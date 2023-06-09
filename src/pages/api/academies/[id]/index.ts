import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { academyValidationSchema } from 'validationSchema/academies';
import { convertQueryToPrismaUtil } from 'server/utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAcademyById();
    case 'PUT':
      return updateAcademyById();
    case 'DELETE':
      return deleteAcademyById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getAcademyById() {
    const data = await prisma.academy.findFirst(convertQueryToPrismaUtil(req.query, 'academy'));
    return res.status(200).json(data);
  }

  async function updateAcademyById() {
    await academyValidationSchema.validate(req.body);
    const data = await prisma.academy.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });
    return res.status(200).json(data);
  }
  async function deleteAcademyById() {
    const data = await prisma.academy.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
