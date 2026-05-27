export class PaginationEngine {
  /*
   -----------------------------------
   GET SKIP
   -----------------------------------
  */

  static getSkip(
    page: number,
    limit: number
  ) {
    return (page - 1) * limit;
  }

  /*
   -----------------------------------
   TOTAL PAGES
   -----------------------------------
  */

  static getTotalPages(
    total: number,
    limit: number
  ) {
    return Math.ceil(total / limit);
  }
}