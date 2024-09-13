export interface Tick {
  value: number;
  backgroundColor: string | undefined;
  label: string;
}

export interface Scale {
  min: Tick;
  max: Tick;
  ticks: Array<Tick>;
}
