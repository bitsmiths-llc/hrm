## Data tables

- Always use `src/components/ui/data-table/*` (the TanStack Table wrapper) for
  tabular data — never a hand-rolled `<table>` for a dataset that could grow.
- Always use `DataTableColumnHeader` for column headers to get built-in sorting.
  Pass `align` to match the column's cell renderer (`align='center'` for any
  column using `CenteredCell` or a centered status badge; omit/`'left'` for
  plain left-aligned text) — otherwise the header renders left-anchored while
  centered data sits below it, misaligned.
- Define columns via a `useColumns` hook when they need other hooks (query client,
  actions); otherwise a plain columns file is fine. See `docs/ui/table.md` for a full
  example (columns hook + table component + pagination/filters).
- Status/state cells render through `Badge` with one of its real variants
  (`default | secondary | destructive | outline`) — see `ui-and-styling.md`. Never
  cast the variant to `any` to bypass the type.
- Row actions that call server actions or mutations follow the same `isLoading` /
  query-key-invalidation rules as everywhere else — see `../rules/react-query.md`.
