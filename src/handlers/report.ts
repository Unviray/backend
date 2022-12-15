import type { Request, Response } from "express";
import {
  Preacher,
  PrismaClient,
  Report,
  TagsOnPreacher,
  Prisma,
} from "@prisma/client";

import type { TWorkingMonth } from "../types/month";
import { MonthNames, MonthNamesShort } from "../constant/month";

const prisma = new PrismaClient();

const makeServiceYears = (wm: TWorkingMonth): TWorkingMonth[] => {
  const endPrev = wm.month >= 9;

  return [
    { month: 9, year: wm.year + (endPrev ? 0 : -1) },
    { month: 10, year: wm.year + (endPrev ? 0 : -1) },
    { month: 11, year: wm.year + (endPrev ? 0 : -1) },
    { month: 12, year: wm.year + (endPrev ? 0 : -1) },
    { month: 1, year: wm.year + (endPrev ? +1 : 0) },
    { month: 2, year: wm.year + (endPrev ? +1 : 0) },
    { month: 3, year: wm.year + (endPrev ? +1 : 0) },
    { month: 4, year: wm.year + (endPrev ? +1 : 0) },
    { month: 5, year: wm.year + (endPrev ? +1 : 0) },
    { month: 6, year: wm.year + (endPrev ? +1 : 0) },
    { month: 7, year: wm.year + (endPrev ? +1 : 0) },
    { month: 8, year: wm.year + (endPrev ? +1 : 0) },
  ];
};

const monthToPrettie = (wm: TWorkingMonth, short = false) => {
  const monthName = short
    ? MonthNamesShort[wm.month - 1]
    : MonthNames[wm.month - 1];

  return `${monthName} ${wm.year}`;
};

export const getReport = async (
  req: Request<{ preacherId: string }, {}, {}, { month: string; year: string }>,
  res: Response
) => {
  const preacherId = parseInt(req.params.preacherId) || 0;
  const month = parseInt(req.query.month || "0");
  const year = parseInt(req.query.year || "0");

  if (month === 0 || year === 0) {
    res.status(400).json({ error: "Invalid month or year" });
    return;
  }

  const result = await prisma.report.findFirst({
    include: { Tags: true },
    where: { month, year, preacherId },
  });

  res.json(result);
};

export const setReport = async (
  req: Request<
    { preacherId: string },
    {},
    {
      publication: number;
      video: number;
      hour: number;
      visit: number;
      study: number;
      note: string;
      tagIds: number[];
    },
    { month: string; year: string }
  >,
  res: Response
) => {
  const preacherId = parseInt(req.params.preacherId) || 0;
  const month = parseInt(req.query.month || "0");
  const year = parseInt(req.query.year || "0");

  if (month === 0 || year === 0) {
    res.status(400).json({ error: "Invalid month or year" });
    return;
  }

  const data = {
    publication: req.body.publication,
    video: req.body.video,
    hour: req.body.hour,
    visit: req.body.visit,
    study: req.body.study,
    note: req.body.note,
    Tags: {
      connect: req.body.tagIds.map((tagId) => ({
        id: tagId,
      })),
    },
  };

  const existing = await prisma.report.findFirst({
    include: { Tags: true },
    where: { month, year, preacherId },
  });

  if (existing !== null) {
    const result = await prisma.report.update({
      where: {
        id: existing.id,
      },
      include: {
        Preacher: true,
        Tags: true,
      },
      data,
    });

    res.json(result);
  } else {
    const result = await prisma.report.create({
      include: {
        Preacher: true,
        Tags: true,
      },
      data: {
        Preacher: {
          connect: {
            id: preacherId,
          },
        },
        month,
        year,
        ...data,
      },
    });

    res.json(result);
  }
};

export const mainBoard = async (req: Request, res: Response) => {
  const result: {
    title: string;
    number: number;
    publication: number;
    video: number;
    hour: number;
    visit: number;
    study: number;
  }[] = [];

  const reports = await prisma.report.findMany({
    where: req.app.get("workingMonth"),
    include: {
      Preacher: {
        include: {
          Tags: true,
        },
      },
      Tags: true,
    },
  });

  reports.forEach((report) => {
    if (report.Tags.length === 0) {
      const r = result.find((v) => v.title === "Mpitory");

      if (r) {
        r.number += 1;
        r.publication += report.publication;
        r.video += report.video;
        r.hour += report.hour;
        r.visit += report.visit;
        r.study += report.study;
      } else {
        result.push({
          title: "Mpitory",
          number: 1,
          publication: report.publication,
          video: report.video,
          hour: report.hour,
          visit: report.visit,
          study: report.study,
        });
      }
    } else {
      report.Tags.forEach((tag) => {
        const r = result.find((v) => v.title === tag.name);
        if (r) {
          r.number += 1;
          r.publication += report.publication;
          r.video += report.video;
          r.hour += report.hour;
          r.visit += report.visit;
          r.study += report.study;
        } else {
          result.push({
            title: tag.name,
            number: 1,
            publication: report.publication,
            video: report.video,
            hour: report.hour,
            visit: report.visit,
            study: report.study,
          });
        }
      });
    }
  });

  result.push({
    title: "Total",
    number: result.map((r) => r.number).reduce((acc, curr) => acc + curr, 0),
    publication: result
      .map((r) => r.publication)
      .reduce((acc, curr) => acc + curr, 0),
    video: result.map((r) => r.video).reduce((acc, curr) => acc + curr, 0),
    hour: result.map((r) => r.hour).reduce((acc, curr) => acc + curr, 0),
    visit: result.map((r) => r.visit).reduce((acc, curr) => acc + curr, 0),
    study: result.map((r) => r.study).reduce((acc, curr) => acc + curr, 0),
  });

  res.json(result);
};

export const getServiceYear = async (
  req: Request<{}, {}, {}, { id: string }>,
  res: Response
) => {
  const serviceYears = makeServiceYears(req.app.get("workingMonth"));
  const id = parseInt(req.query.id || "0");

  const result = [];
  for (const wm of serviceYears) {
    const item = (
      await prisma.report.findMany({
        select: {
          publication: true,
          video: true,
          hour: true,
          visit: true,
          study: true,
        },
        where: { ...wm, preacherId: id || undefined },
      })
    ).reduce(
      (acc, curr) => ({
        publication: acc.publication + curr.publication,
        video: acc.video + curr.video,
        hour: acc.hour + curr.hour,
        visit: acc.visit + curr.visit,
        study: acc.study + curr.study,
      }),
      {
        publication: 0,
        video: 0,
        hour: 0,
        visit: 0,
        study: 0,
      }
    );

    result.push({
      month: monthToPrettie(wm, true),
      ...item,
    });
  }

  res.json(result);
};

export const getReturnedService = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const id = parseInt(req.params.id) || 0;
  const serviceYears = makeServiceYears(req.app.get("workingMonth"));

  const result: { label: string; returned: boolean }[] = [];

  for (const month of serviceYears) {
    const report = await prisma.report.findFirst({
      where: { ...month, preacherId: id },
    });
    result.push({
      label: `${MonthNamesShort[month.month - 1]} ${month.year}`,
      returned: report !== null,
    });
  }

  res.json(result);
};

export const summary = (req: Request, res: Response) => {
  type queryResult = Report & {
    Preacher: Preacher & { Tags: TagsOnPreacher[] };
  };

  const filterTag = (report: queryResult) => {
    console.log(req.query.include);
    if (req.query.include) {
      let pass = false;

      report.Preacher.Tags.forEach((tag) => {
        if (
          (req.query.include as string)
            .split(",")
            .includes(tag.tagId.toString())
        ) {
          pass = true;
        }
      });

      return pass;
    }
    if (req.query.exclude) {
      let pass = true;

      report.Preacher.Tags.forEach((tag) => {
        if (
          (req.query.exclude as string)
            .split(",")
            .includes(tag.tagId.toString())
        ) {
          pass = false;
        }
      });

      return pass;
    }

    return true;
  };

  const mapReport = (report: queryResult) => {
    return {
      id: report.id,
      month: report.month,
      year: report.year,
      publication: report.publication,
      video: report.video,
      hour: report.hour,
      visit: report.visit,
      study: report.study,
      note: report.note,
    };
  };

  const monthFilter = (report: ReturnType<typeof mapReport>) => {
    const { month, year } = req.app.get("workingMonth");

    return report.month === month - 1 && report.year === year;
  };

  const reportReducer = (
    acc: {
      number: number;
      publication: number;
      video: number;
      hour: number;
      visit: number;
      study: number;
    },
    report: ReturnType<typeof mapReport>
  ) => {
    return {
      number: acc.number + 1,
      publication: acc.publication + report.publication,
      video: acc.video + report.video,
      hour: acc.hour + report.hour,
      visit: acc.visit + report.visit,
      study: acc.study + report.study,
    };
  };

  prisma.report
    .findMany({
      include: {
        Preacher: {
          include: {
            Tags: true,
          },
        },
      },
    })
    .then((reports) => {
      res.json(
        reports
          .filter(filterTag)
          .map(mapReport)
          .filter(monthFilter)
          .reduce(reportReducer, {
            number: 0,
            publication: 0,
            video: 0,
            hour: 0,
            visit: 0,
            study: 0,
          })
      );
    });
};
