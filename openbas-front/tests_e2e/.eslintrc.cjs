module.exports = {
  extends: [
    'plugin:playwright/recommended'
  ],
  "rules": {
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          "**/*.ts"
        ]
      }
    ]
  }
}