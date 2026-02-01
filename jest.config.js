/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom", // ← Ключевая строка! Включает DOM API

  // Где искать тесты
  testMatch: ["<rootDir>/src/js/**/*.test.js", "<rootDir>/src/js/**/*.spec.js"],

  // Что не тестировать
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/js/app.js", // исключаем точку входа
  ],

  // Для того, чтобы в тестах можно было использовать import/export
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Дополнительно: если хочешь видеть покрытие кода
  collectCoverageFrom: [
    "src/js/classes/**/*.js",
    "!src/js/app.js",
    "!src/js/index.js",
  ],
};

module.exports = config;
