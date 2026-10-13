/**
 * Splits a list into consecutive runs of at most `size` items. Long link grids
 * render one <ul> per run so no element has more than 60 children (the point
 * where audits flag excessive DOM width). Pick a size divisible by every column
 * count the grid uses, so each run ends on a full row and the runs line up as
 * one continuous grid.
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  const runs: T[][] = [];
  for (let i = 0; i < items.length; i += size) runs.push(items.slice(i, i + size));
  return runs;
}
