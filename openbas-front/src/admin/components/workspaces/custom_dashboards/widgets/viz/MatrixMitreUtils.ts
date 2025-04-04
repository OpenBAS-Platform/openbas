import { type AttackPattern, type EsSeriesData } from '../../../../../../utils/api-types';

// eslint-disable-next-line import/prefer-default-export
export const resolvedData = (attackPatternMap: Record<string, AttackPattern>, data: EsSeriesData[]) => {
  return data.map((d) => {
    const attackPattern = Object.values(attackPatternMap).find(a => a.attack_pattern_id === d.key);
    if (attackPattern) {
      const match = attackPattern.attack_pattern_external_id.match(/(T\d{4})/);
      return {
        key: d.key,
        value: d.value,
        label: d.label,
        ttp: match ? match[1] : null,
      };
    }
    return null;
  }).filter(d => d !== null);
};
