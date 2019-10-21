module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:import/errors",
    ],
    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2018,
    },
    "plugins": [
        "import",
    ],
    "rules": {
        "require-atomic-updates": "off", // https://github.com/eslint/eslint/issues/11899
        "semi": "off",
    },
}