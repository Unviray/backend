import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const getAllPreacher = (
  req: Request<{}, {}, {}, { search: string; tags?: string }>,
  res: Response
) => {
  const { search, tags } = req.query;

  prisma.preacher
    .findMany({
      where: { fullName: { contains: search } },
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

export const setPreacher = async (
  req: Request<
    { id: string },
    {},
    {
      id: number;
      group: number;
      firstname: string;
      lastname: string;
      displayname: string;
      birth: string | null;
      baptism: string | null;
      address: string;
      phones: string[];
      tagIds: number[];
    }
  >,
  res: Response
) => {
  const { id: targetId } = req.params;

  const result = await prisma.preacher.upsert({
    include: {
      Tags: true,
      Group: true,
    },
    where: {
      id: parseInt(targetId), //parseInt
    },
    create: {
      id: req.body.id,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      fullName: `${req.body.firstname} ${req.body.lastname}`,
      displayName: req.body.displayname,
      address: req.body.address,
      baptism:
        req.body.baptism !== null ? moment(req.body.baptism).toDate() : null,
      birth: req.body.birth !== null ? moment(req.body.birth).toDate() : null,
      phones: JSON.stringify(req.body.phones),
      Tags: {
        create: req.body.tagIds.map((tagId) => ({
          Tag: {
            connect: {
              id: tagId,
            },
          },
        })),
      },
      Group: {
        connectOrCreate: {
          where: { id: req.body.group },
          create: { id: req.body.group },
        },
      },
    },
    update: {
      id: req.body.id,
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      fullName: `${req.body.firstname} ${req.body.lastname}`,
      displayName: req.body.displayname,
      //phones: JSON.stringify(req.body.phones),
      address: req.body.address,
      baptism:
        req.body.baptism !== null ? moment(req.body.baptism).toDate() : null,
      birth: req.body.birth !== null ? moment(req.body.birth).toDate() : null,
      phones: JSON.stringify(req.body.phones),
      Group: {
        connectOrCreate: {
          where: { id: req.body.group },
          create: { id: req.body.group },
        },
      },
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
