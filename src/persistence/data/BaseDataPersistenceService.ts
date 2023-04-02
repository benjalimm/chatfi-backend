import { PrismaClient } from '@prisma/client';

export default class BaseDataPersistenceService {
  private _prisma: PrismaClient;
  get prisma(): PrismaClient {
    return this._prisma;
  }
  constructor() {
    this._prisma = new PrismaClient();
  }

  async onMain<T>(main: () => Promise<T>): Promise<T> {
    return new Promise((res, rej) => {
      main()
        .then(async (result) => {
          res(result);
          await this.prisma.$disconnect();
        })
        .catch(async (e) => {
          rej(e);
          await this.prisma.$disconnect();
        });
    });
  }
}
