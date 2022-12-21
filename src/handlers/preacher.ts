import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

import type { TMonthNumbers, TWorkingMonth } from "../types/month";
import { Month } from "../month";

const prisma = new PrismaClient();

export const getAllPreacher = (
  req: Request<
    {},
    {},
    {},
    { search: string; tags?: string; archived?: string }
  >,
  res: Response
) => {
  const { search, tags, archived } = req.query;

  prisma.preacher
    .findMany({
      where: {
        fullName: { contains: search },
        archived: archived === "1" ? true : false,
      },
      include: { Tags: true },
    })
    .then((preachers) => {
      res.json(
        preachers
          .filter((preacher) =>
            tags
              ? preacher.Tags.map((tag) => tag.tagId).some((tagId) =>
                  tags.split(",").includes(tagId.toString(10))
                )
              : true
          )
          .map((preacher) => preacher.id)
          .sort((a, b) => a - b)
      );
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
    const wm = req.app.get("workingMonth");
    const tags: {
      id: number;
      name: string;
      color: string;
      soon?: {
        start: TWorkingMonth;
        end: TWorkingMonth;
      };
      current?: {
        start: TWorkingMonth;
        end: TWorkingMonth;
      };
    }[] = [];

    for (const tag of preacher.Tags) {
      const tagResult = await prisma.tag.findUnique({
        where: { id: tag.tagId },
      });

      const Wm = new Month(wm);

      const soon =
        tag.startMonth &&
        Wm.nextMonth().month === tag.startMonth &&
        Wm.nextMonth().year === tag.startYear
          ? {
              start: {
                month: tag.startMonth as TMonthNumbers,
                year: tag.startYear!,
              },
              end: { month: tag.endMonth as TMonthNumbers, year: tag.endYear! },
            }
          : undefined;

      const current =
        tag.startMonth &&
        Wm.between(
          { month: tag.startMonth as TMonthNumbers, year: tag.startYear! },
          { month: tag.endMonth as TMonthNumbers, year: tag.endYear! }
        )
          ? {
              start: {
                month: tag.startMonth as TMonthNumbers,
                year: tag.startYear!,
              },
              end: { month: tag.endMonth as TMonthNumbers, year: tag.endYear! },
            }
          : undefined;

      if (tagResult !== null) {
        if (tag.startMonth) {
          if (soon || current) {
            tags.push({ ...tagResult, soon, current });
          }
        } else {
          tags.push(tagResult);
        }
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

export const updatePreacher = async (
  req: Request<
    { id: string },
    {},
    {
      id?: number;
      group?: number;
      firstname?: string;
      lastname?: string;
      displayname?: string;
      birth?: string | null;
      baptism?: string | null;
      address?: string;
      phones?: string[];
      tagIds?: number[];
      archived?: boolean;
    }
  >,
  res: Response
) => {
  const { id: targetId } = req.params;

  const result = await prisma.preacher.update({
    include: {
      Tags: true,
      Group: true,
    },
    where: {
      id: +targetId, //parseInt
    },
    data: {
      id: req.body.id,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      fullName:
        req.body.firstname && req.body.lastname
          ? `${req.body.firstname} ${req.body.lastname}`
          : undefined,
      displayName: req.body.displayname,
      address: req.body.address,
      baptism: req.body.baptism ? moment(req.body.baptism).toDate() : undefined,
      birth: req.body.birth ? moment(req.body.birth).toDate() : undefined,
      phones: JSON.stringify(req.body.phones),
      groupId: req.body.group,
      archived: req.body.archived,
    },
  });

  res.json(result);
};

export const createPreacher = async (
  req: Request<
    {},
    {},
    {
      id: number;
      group: number;
      firstname: string;
      lastname?: string;
      displayname: string;
      birth?: string | null;
      baptism?: string | null;
      address?: string;
      phones?: string[];
      tagIds?: number[];
      archived?: boolean;
    }
  >,
  res: Response
) => {
  const result = await prisma.preacher.create({
    include: {
      Tags: true,
      Group: true,
    },
    data: {
      id: req.body.id,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      fullName: `${req.body.firstname} ${req.body.lastname}`,
      displayName: req.body.displayname,
      address: req.body.address,
      baptism: req.body.baptism ? moment(req.body.baptism).toDate() : null,
      birth: req.body.birth ? moment(req.body.birth).toDate() : null,
      phones: JSON.stringify(req.body.phones || "[]"),
      Group: {
        connectOrCreate: {
          where: { id: req.body.group },
          create: { id: req.body.group },
        },
      },
      archived: req.body.archived || false,
    },
  });

  res.json(result);
};

export const getReturnedInfo = (req: Request, res: Response) => {
  const workingMonth = req.app.get("workingMonth");
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
