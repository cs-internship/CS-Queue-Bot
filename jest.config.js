module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: [
        "bot/**/*.js",
        "!bot/**/__tests__/**",
        "!bot/config/config.js",
    ],
    coverageDirectory: "coverage",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testPathIgnorePatterns: ["/node_modules/", "/coverage/"],
};
