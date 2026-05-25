import { db } from "@/lib/db";

export class PFOSEngine {
  static async getUserEntries(userId: string) {
    return db.entry.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async createEntry(data: {
    title: string;
    description?: string;
    amount: number;
    category: string;
    userId: string;
  }) {
    return db.entry.create({
      data,
    });
  }
}