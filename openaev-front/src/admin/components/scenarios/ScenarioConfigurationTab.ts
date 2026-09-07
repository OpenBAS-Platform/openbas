// The scenario authoring context (teams, variables, media pressure) surfaced
// from the hero "Configuration" action, one section per tab, so the Injects
// tab stays focused on the inject list alone.
// Challenges are authored inside injects, so they are not configured here -
// the hero exposes a "Preview challenges page" action instead.
enum ScenarioConfigurationTab {
  TEAMS = 0,
  VARIABLES = 1,
  MEDIA_PRESSURE = 2,
}

export default ScenarioConfigurationTab;
