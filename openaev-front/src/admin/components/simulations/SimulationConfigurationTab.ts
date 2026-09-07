// Tab indices are surfaced as a named enum (rather than magic numbers) so deep-link callers
// (e.g. the "manage custom variables" link in AvailableVariablesDialog) can target a specific
// tab without duplicating/guessing its position, and stay correct if tabs are ever reordered.
export enum SimulationConfigurationTab {
  TEAMS = 0,
  VARIABLES = 1,
  MEDIA_PRESSURE = 2,
}

export default SimulationConfigurationTab;
