import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getWorkingMonth } from "../store/working-month";

const prisma = new PrismaClient();

export const getAllPreacher = (
  req: Request<{}, {}, {}, { search: string }>,
  res: Response
) => {
  const { search } = req.query;
  prisma.preacher
    .findMany({
      select: { id: true },
      where: { fullName: { contains: search } },
    })
    .then((preachers) => {
      res.json(preachers.map((preacher) => preacher.id));
    });
};

export const getPreacher = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id) || 0;

  if (id === 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const preacher = await prisma.preacher.findFirst({
    where: { id },
    include: { Tags: true, Report: true },
  });

  if (preacher === null) {
    res.status(404).json({ error: `No preacher have id ${id}` });
  } else {
    const wm = getWorkingMonth();
    const tags: { id: number; name: string; color: string }[] = [];

    for (const tag of preacher.Tags) {
      const tagResult = await prisma.tag.findUnique({
        where: { id: tag.tagId },
      });
      if (tagResult !== null) {
        tags.push(tagResult);
      }
    }

    res.json({
      id: preacher.id,
      group: preacher.groupId,
      returned:
        preacher.Report.find(
          (report) => report.month === wm.month && report.year === wm.year
        ) !== undefined,
      displayName: preacher.displayName,
      fullName: preacher.fullName,
      firstName: preacher.firstName,
      lastName: preacher.lastName,
      phones: JSON.parse(preacher.phones || "[]"),
      address: preacher.address,
      birth: preacher.birth,
      baptism: preacher.baptism,
      tags,
    });
  }
};

export const getReturnedInfo = (req: Request, res: Response) => {
  const workingMonth = getWorkingMonth();
  prisma.preacher.findMany({ include: { Report: true } }).then((preachers) => {
    let returned = 0;

    preachers.forEach((preacher) => {
      const report = preacher.Report.find(
        (r) => r.month === workingMonth.month && r.year === workingMonth.year
      );

      if (report) {
        if (report.hour > 0) {
          returned += 1;
        }
      }
    });

    res.json({
      total: preachers.length,
      returned,
      notReturned: preachers.length - returned,
    });
  });
};
