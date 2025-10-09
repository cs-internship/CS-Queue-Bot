module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: ["bot/utils/**/*.js", "!bot/utils/*index.js"],
    coverageDirectory: "coverage",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
