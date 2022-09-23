import {
  Group,
  Preacher,
  Prisma,
  PrismaClient,
  TagsOnPreacher,
} from "@prisma/client";
import express from "express";
import moment from "moment";
import Color from "color";

import es21db from "../../../../.es21/db.json";

const app = express();

// fetch random color palette

const prisma = new PrismaClient();

const monthMap = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

interface Es21Tatitra {
  zavatra_napetraka: number;
  video: number;
  ora: number;
  fitsidihana: number;
  fampianarana: number;
  fanamarihana: string;
  mpisavalalana: string;
}

interface Es21 {
  id: number;
  anarana: string;
  fanampinanarana: string;
  anarana_feno?: string;
  finday: string[];
  adiresy: string;
  teraka: string | null;
  batisa: string | null;
  groupe: number;
  tombotsoa: string;
  tatitra: { [month: string]: Es21Tatitra };
  lahy_sa_vavy: string;
  maharitra: boolean;
}

const create_report = async (
  preacher: Preacher & {
    Tags: TagsOnPreacher[];
    Group: Group;
  },
  id: string,
  data: Es21Tatitra
) => {
  const month = monthMap[id.split("_")[0] as keyof typeof monthMap];
  const year = parseInt(id.split("_")[1]);

  const reportTags: Prisma.Enumerable<Prisma.TagCreateOrConnectWithoutPreachersInput> =
    [];

  if (data.mpisavalalana === "Reg") {
    reportTags.push({
      where: {
        name: "Mpisavalalana maharitra",
      },
      create: {
        name: "Mpisavalalana maharitra",
        color: Color({
          r: Math.floor(Math.random() * 255),
          g: Math.floor(Math.random() * 255),
          b: Math.floor(Math.random() * 255),
        }).hex(),
      },
    });
  }
  if (data.mpisavalalana === "Aux") {
    reportTags.push({
      where: {
        name: "Mpisavalalana mpanampy",
      },
      create: {
        name: "Mpisavalalana mpanampy",
        color: Color({
          r: Math.floor(Math.random() * 255),
          g: Math.floor(Math.random() * 255),
          b: Math.floor(Math.random() * 255),
        }).hex(),
      },
    });
  }

  await prisma.report.create({
    data: {
      Preacher: {
        connect: {
          id: preacher.id,
        },
      },
      month,
      year,
      publication: data.zavatra_napetraka,
      video: data.video,
      hour: data.ora,
      visit: data.fitsidihana,
      study: data.fampianarana,
      note: data.fanamarihana,
      Tags: {
        connectOrCreate: reportTags,
      },
    },
    include: {
      Preacher: true,
      Tags: true,
    },
  });
};

const create_preacher = async (id: string, data: Es21) => {
  const tags: {
    Tag: {
      connectOrCreate: {
        where: {
          name: string;
        };
        create: {
          name: string;
          color: string;
        };
      };
    };
  }[] = [];

  if (data.tombotsoa !== "") {
    tags.push({
      Tag: {
        connectOrCreate: {
          where: {
            name: data.lahy_sa_vavy,
          },
          create: {
            name: data.lahy_sa_vavy,
            color: Color({
              r: Math.floor(Math.random() * 255),
              g: Math.floor(Math.random() * 255),
              b: Math.floor(Math.random() * 255),
            }).hex(),
          },
        },
      },
    });
  }

  if (data.tombotsoa !== "") {
    tags.push({
      Tag: {
        connectOrCreate: {
          where: {
            name: data.tombotsoa,
          },
          create: {
            name: data.tombotsoa,
            color: Color({
              r: Math.floor(Math.random() * 255),
              g: Math.floor(Math.random() * 255),
              b: Math.floor(Math.random() * 255),
            }).hex(),
          },
        },
      },
    });
  }

  if (data.maharitra) {
    tags.push({
      Tag: {
        connectOrCreate: {
          where: {
            name: "Mpisavalalana maharitra",
          },
          create: {
            name: "Mpisavalalana maharitra",
            color: Color({
              r: Math.floor(Math.random() * 255),
              g: Math.floor(Math.random() * 255),
              b: Math.floor(Math.random() * 255),
            }).hex(),
          },
        },
      },
    });
  }

  try {
    const preacher = await prisma.preacher.create({
      data: {
        displayName:
          (data as Es21).anarana_feno ||
          `${data.anarana} ${data.fanampinanarana}`,
        fullName:
          (data as Es21).anarana_feno ||
          `${data.anarana} ${data.fanampinanarana}`,
        lastName: data.anarana,
        firstName: data.fanampinanarana,
        phones: JSON.stringify(data.finday.filter((f) => f.length > 0)),
        address: data.adiresy,
        birth: data.teraka ? moment(data.teraka.split(":")[1]).toDate() : null,
        baptism: data.batisa
          ? moment(data.batisa.split(":")[1]).toDate()
          : null,
        Group: {
          connectOrCreate: {
            where: {
              id: data.groupe,
            },
            create: {
              id: data.groupe,
            },
          },
        },
        Tags: {
          create: tags,
        },
      },
      include: {
        Group: true,
        Tags: true,
      },
    });

    for (const [id, raw_report] of Object.entries(data.tatitra)) {
      await create_report(preacher, id, raw_report);
    }
  } catch (e) {
    console.log(
      (data as Es21).anarana_feno || `${data.anarana} ${data.fanampinanarana}`
    );
    console.error(e);
  }
};

async function main() {
  for (const [id, data] of Object.entries(es21db._default)) {
    await create_preacher(id, data);
  }
}

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export const sreport = app;
