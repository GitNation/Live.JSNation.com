import {
  convertEventTimeToISO,
  createTimeRange,
  convertEventTimeToLocal,
  iso2sec,
} from '../time-provider';

const trackStepInMin = 5;
const pxPerMinute = 50 / trackStepInMin;

export const createTimeTicks = (startEvent, endEvent) => {
  const isoStart = convertEventTimeToISO(startEvent.date, startEvent.time);
  const isoEnd = convertEventTimeToISO(endEvent.date, endEvent.time);
  const ticks = createTimeRange(isoStart, isoEnd, trackStepInMin);

  return ticks;
};

export const calcPositionFromTime = (startEvent, k = 1) => {
  const isoStart = convertEventTimeToISO(startEvent.date, startEvent.time);
  const secStart = iso2sec(isoStart);
  return (event) => {
    const { date, time, track, z } = event;
    const local = convertEventTimeToLocal(date || track, time, z);
    const sec = local.sec;
    const dist = ((sec - secStart) * pxPerMinute * k) / 60;
    return dist;
  };
};

export const calcWidth = (duration, k = 1) => {
  const mm = parseInt(duration, 10);
  const width = mm * pxPerMinute * k;
  return width;
};
