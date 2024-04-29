import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { formatDate } from "@lib/core/utils/date-formatter";

describe("Date Formatter", () => {
  it("should return the date in the format: yy-MMM-d", () => {
    const date = new Date("2021-01-01");
    const formattedDate = formatDate({
      date,
      dateFormat: "yy-MMM-d",
    });

    assert.strictEqual(formattedDate, "21-Jan-1");
  });

  it("should return the date in the format: dd-m-yyyy", () => {
    const date = new Date("2021-01-01");
    const formattedDate = formatDate({
      date,
      dateFormat: "dd-m-yyyy",
    });

    assert.strictEqual(formattedDate, "01-1-2021");
  });

  it("should return the date in the format: MMMM-dd-yyyy with custom separator (/) and custom locale", () => {
    const date = new Date("2021-01-01");
    const formattedDate = formatDate({
      date,
      dateFormat: "MMMM-dd-yyyy",
      separator: "/",
      locale: "es",
    });

    assert.strictEqual(formattedDate, "Enero/01/2021");
  });

  it("should return the date in the format: d/mm/yy with custom separator (-)", () => {
    const date = new Date("2021-01-01");
    const formattedDate = formatDate({
      date,
      dateFormat: "d/mm/yy",
      separator: "-",
    });

    assert.strictEqual(formattedDate, "1-01-21");
  });
});
