import moment, { Moment, MomentInput } from 'moment';

const TimeUtil = {
  common(inp?: MomentInput): Moment {
    return moment(inp);
  },
  date(inp?: number | string | Date): Date {
    return new Date(inp);
  },
  newDate(): Date {
    return new Date();
  },
  getProgress(startAt: string | number | Date, endAt: string | number | Date): number {
    const diff = moment().diff(moment(startAt), 'day') / moment(endAt).diff(moment(startAt), 'day');
    if (diff * 100 <= 100) {
      return diff * 100;
    }
    return 100;
  },
};

export default TimeUtil;
