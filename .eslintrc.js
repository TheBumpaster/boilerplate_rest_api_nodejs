module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: "module" // Allows for the use of imports
    },
    extends: [
        "plugin:@typescript-eslint/recommended" // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/no-duplicate-imports":"error",
        "@typescript-eslint/prefer-as-const": "warn",
        "@typescript-eslint/prefer-for-of":"warn",
        "@typescript-eslint/naming-convention": [
            "error",
            // Enforce that variables are in camelCase
            { "selector": "variableLike", "format": ["camelCase"] },
            // Enforce that private members are prefixed with an underscore
            {
                "selector": "memberLike",
                "modifiers": ["private"],
                "format": ["camelCase"],
                "leadingUnderscore": "require"
            },
            // Enforce that variable and function names are in PascalCase
            {
                "selector": ["function", "class"],
                "format": ["PascalCase"],
                "leadingUnderscore": "allow"
            },
            // Ignore destructured names
            {
                "selector": "variable",
                "modifiers": ["destructured"],
                "format": null
            }
        ],
    }
};