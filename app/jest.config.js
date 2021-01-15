module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: ["/tests", "/*.test.js"],
  verbose: true,
  setupFilesAfterEnv: ["./jest.setup.js"],
};
