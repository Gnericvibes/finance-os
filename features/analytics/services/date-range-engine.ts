export class DateRangeEngine {
  /*
   -----------------------------------
   CUSTOM RANGE PARSER
   -----------------------------------
  */

  static parseCustomRange(
    from?: string,
    to?: string
  ) {
    /*
     -----------------------------------
     TODAY
     -----------------------------------
    */

    const today =
      new Date();

    /*
     -----------------------------------
     DEFAULT START
     -----------------------------------
    */

    const defaultStart =
      new Date();

    defaultStart.setDate(
      today.getDate() - 30
    );

    /*
     -----------------------------------
     START DATE
     -----------------------------------
    */

    const start = from
      ? new Date(from)
      : defaultStart;

    /*
     -----------------------------------
     END DATE
     -----------------------------------
    */

    const end = to
      ? new Date(to)
      : today;

    /*
     -----------------------------------
     END OF DAY FIX
     -----------------------------------
    */

    end.setHours(
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
    };
  }
}