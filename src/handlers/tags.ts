import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTags = (req: Request, res: Response) => {
  prisma.tag.findMany().then((tags) => res.json(tags));
};
