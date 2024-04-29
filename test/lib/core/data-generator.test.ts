import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  generateDaysGrid,
  generateInlineMonthsObject,
  generateInlineYearsObject,
} from "@lib/core/utils/data-generator";

describe("Inline Years Object", () => {
  it("Should return prev and next year as null when minYear is equal to maxYear", () => {
    const years = generateInlineYearsObject({
      activeYear: 2024,
      maxYear: 2024,
      minYear: 2024,
    });

    assert.deepEqual(years, {
      prevYear: null,
      nextYear: null,
    });
  });

  it("Should return prev year as null when activeYear is equal to minYear", () => {
    const years = generateInlineYearsObject({
      activeYear: 2024,
      maxYear: 2025,
      minYear: 2024,
    });

    assert.deepEqual(years, {
      prevYear: null,
      nextYear: 2025,
    });
  });

  it("Should return next year as null when activeYear is equal to maxYear", () => {
    const years = generateInlineYearsObject({
      activeYear: 2025,
      maxYear: 2025,
      minYear: 2024,
    });

    assert.deepEqual(years, {
      prevYear: 2024,
      nextYear: null,
    });
  });

  it("Should throw an error when minYear is greater than maxYear", () => {
    assert.throws(() => {
      generateInlineYearsObject({
        activeYear: 2024,
        maxYear: 2023,
        minYear: 2024,
      });
    });
  });

  it("Should throw an error when activeYear is less than minYear or activeYear is greater than maxYear", () => {
    assert.throws(() => {
      generateInlineYearsObject({
        activeYear: 2023,
        maxYear: 2024,
        minYear: 2024,
      });
    });

    assert.throws(() => {
      generateInlineYearsObject({
        activeYear: 2025,
        maxYear: 2024,
        minYear: 2024,
      });
    });
  });

  it("Should return a valid Object when activeYear is between minYear and maxYear", () => {
    const years = generateInlineYearsObject({
      activeYear: 2024,
      maxYear: 2025,
      minYear: 2023,
    });

    assert.deepEqual(years, {
      prevYear: 2023,
      nextYear: 2025,
    });
  });
});

describe("Inline Months Object", () => {
  it("Should return prev and next month as null when minMonth is equal to maxMonth", () => {
    const months = generateInlineMonthsObject({
      activeMonth: 6,
      maxMonth: 6,
      minMonth: 6,
    });

    assert.deepEqual(months, {
      prevMonth: null,
      nextMonth: null,
    });
  });

  it("Should return prev month as null when activeMonth is equal to minMonth", () => {
    const months = generateInlineMonthsObject({
      activeMonth: 6,
      maxMonth: 7,
      minMonth: 6,
    });

    assert.deepEqual(months, {
      prevMonth: null,
      nextMonth: 7,
    });
  });

  it("Should return next month as null when activeMonth is equal to maxMonth", () => {
    const months = generateInlineMonthsObject({
      activeMonth: 7,
      maxMonth: 7,
      minMonth: 6,
    });

    assert.deepEqual(months, {
      prevMonth: 6,
      nextMonth: null,
    });
  });

  it("Should throw an error when minMonth is greater than maxMonth", () => {
    assert.throws(() => {
      generateInlineMonthsObject({
        activeMonth: 6,
        maxMonth: 5,
        minMonth: 6,
      });
    });
  });

  it("Should throw an error when activeMonth is less than minMonth or activeMonth is greater than maxMonth", () => {
    assert.throws(() => {
      generateInlineMonthsObject({
        activeMonth: 5,
        maxMonth: 6,
        minMonth: 6,
      });
    });

    assert.throws(() => {
      generateInlineMonthsObject({
        activeMonth: 8,
        maxMonth: 7,
        minMonth: 6,
      });
    });
  });

  it("Should return a valid Object when activeMonth is between minMonth and maxMonth", () => {
    const months = generateInlineMonthsObject({
      activeMonth: 6,
      maxMonth: 7,
      minMonth: 5,
    });

    assert.deepEqual(months, {
      prevMonth: 5,
      nextMonth: 7,
    });
  });

  it("Should return a valid Object when activeMonth is between minMonth and maxMonth with custom maxYear and minYear", () => {
    const months = generateInlineMonthsObject({
      activeMonth: 0,
      maxMonth: 1,
      minMonth: 11,
      activeYear: 2024,
      maxYear: 2024,
      minYear: 2023,
    });

    assert.deepEqual(months, {
      prevMonth: 11,
      nextMonth: 1,
    });
  });
});

describe("Days Array", () => {
  it("Should return an array of 31 days when the month is January", () => {
    const { days } = generateDaysGrid({
      activeDate: new Date("2024-01-01"),
      maxDate: new Date("2024-01-31"),
      minDate: new Date("2024-01-01"),
    });

    assert.strictEqual(days.length, 31);
  });

  it("Shoudl return the week day name index of the first day of the month", () => {
    const { weekDayStart } = generateDaysGrid({
      activeDate: new Date("2024-05-29"),
      maxDate: new Date("2024-05-31"),
      minDate: new Date("2024-01-01"),
    });

    assert.strictEqual(weekDayStart, 3);
  });

  it("Should throw an error when the active date is less than the min date", () => {
    assert.throws(() => {
      generateDaysGrid({
        activeDate: new Date("2024-05-29"),
        maxDate: new Date("2024-05-31"),
        minDate: new Date("2024-06-01"),
      });
    });
  });

  it("Should throw an error when the active date is greater than the max date", () => {
    assert.throws(() => {
      generateDaysGrid({
        activeDate: new Date("2024-05-29"),
        maxDate: new Date("2024-05-28"),
        minDate: new Date("2024-01-01"),
      });
    });
  });

  it("Should throw an error when the min date is greater than the max date", () => {
    assert.throws(() => {
      generateDaysGrid({
        activeDate: new Date("2024-05-29"),
        maxDate: new Date("2024-05-31"),
        minDate: new Date("2024-06-01"),
      });
    });
  });
});
