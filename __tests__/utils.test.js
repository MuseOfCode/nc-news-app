const {
  convertTimestampToDate,
  createArticleLookup
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});


describe("createArticleLookup", () => {
  test("returns an empty object when given an empty array", () => {
    expect(createArticleLookup([])).toEqual({});
  });

  test("returns an object with a single article title mapped to its article_id", () => {
    const input = [{ article_id: 1, title: "First Article" }];
    const expectedOutput = { "First Article": 1 };
    expect(createArticleLookup(input)).toEqual(expectedOutput);
  });

  test("returns a lookup object for multiple articles", () => {
    const input = [
      { article_id: 1, title: "First Article" },
      { article_id: 2, title: "Second Article" },
      { article_id: 3, title: "Third Article" }
    ];
    const expectedOutput = {
      "First Article": 1,
      "Second Article": 2,
      "Third Article": 3
    };
    expect(createArticleLookup(input)).toEqual(expectedOutput);
  });

  test("ignores extra properties in the articles", () => {
    const input = [
      { article_id: 1, title: "First Article", body: "Content here", author: "John Doe" },
      { article_id: 2, title: "Second Article", body: "Another content", author: "Jane Doe" }
    ];
    const expectedOutput = {
      "First Article": 1,
      "Second Article": 2
    };
    expect(createArticleLookup(input)).toEqual(expectedOutput);
  });

  test("does not modify the original input array", () => {
    const input = [{ article_id: 1, title: "First Article" }];
    const inputCopy = [...input]; // Shallow copy to check for mutations
    createArticleLookup(input);
    expect(input).toEqual(inputCopy);
  });
});