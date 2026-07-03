// Throwaway file to exercise the Claude PR reviewer (BIT-2). Safe to delete.
// It intentionally contains a couple of rule violations so we can confirm the
// reviewer posts inline comments with the right severity tiers.

export function sumValues(values: any[]) {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total;
}

// Direct process.env access outside src/env.ts — should be flagged as a blocker.
export const defaultRegion = process.env.AWS_REGION ?? 'us-east-1';
