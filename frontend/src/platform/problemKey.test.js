import { describe, expect, it } from 'vitest';
import { buildingFromProblemKey, parseProblemKey } from './problemKey';

describe('problem keys', () => {
  it('resolves a numeric crowd key', () => {
    expect(parseProblemKey('crowd:12:45')).toEqual({ type: 'crowd', buildingId: '12', roomId: '45' });
    expect(buildingFromProblemKey('infrastructure:12:45')).toBe('12');
  });

  it('rejects model and null keys', () => {
    expect(parseProblemKey('crowd:model:week')).toBeNull();
    expect(buildingFromProblemKey('crowd:null:45')).toBe('');
    expect(buildingFromProblemKey('maintenance:9')).toBe('');
  });
});
