// src/modules/timetable/constants/timetable.constants.js

export const WEEK_DAYS = [
  { value: "MON", label: "Monday", short: "Mon" },
  { value: "TUE", label: "Tuesday", short: "Tue" },
  { value: "WED", label: "Wednesday", short: "Wed" },
  { value: "THU", label: "Thursday", short: "Thu" },
  { value: "FRI", label: "Friday", short: "Fri" },
];

export const PERIOD_TYPES = {
  LECTURE: "LECTURE",
  LAB: "LAB",
  BREAK: "BREAK",
  LUNCH: "LUNCH",
};

export const TIME_SLOTS = [
  {
    value: "08:00 - 08:45",
    start: "08:00",
    end: "08:45",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "08:45 - 09:30",
    start: "08:45",
    end: "09:30",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "09:30 - 10:15",
    start: "09:30",
    end: "10:15",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "10:15 - 11:00",
    start: "10:15",
    end: "11:00",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "11:00 - 11:45",
    start: "11:00",
    end: "11:45",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "11:45 - 12:30",
    start: "11:45",
    end: "12:30",
    type: PERIOD_TYPES.LUNCH,
    label: "Lunch Break",
  },
  {
    value: "12:30 - 13:15",
    start: "12:30",
    end: "13:15",
    type: PERIOD_TYPES.LECTURE,
  },
  {
    value: "13:15 - 14:00",
    start: "13:15",
    end: "14:00",
    type: PERIOD_TYPES.LECTURE,
  },
];

export const TIMETABLE_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  ARCHIVED: "archived",
};
