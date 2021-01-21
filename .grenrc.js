module.exports = {
    "prefix": "Version ",
    "ignoreIssuesWith": [
        "duplicate",
        "wontfix",
        "invalid",
        "help wanted"
    ],
    "template": {
        "issue": "- [{{text}}]({{url}}) {{name}}"
    },
    "groupBy": {
        "Enhancements:": ["feature", "internal", "build", "documentation", "refactor"],
        "Bug Fixes:": ["bug"]
    }
};
