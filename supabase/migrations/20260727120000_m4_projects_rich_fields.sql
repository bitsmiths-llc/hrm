-- Add rich fields to the overtime projects table.
-- Default values are provided to ensure existing rows do not violate NOT NULL constraints.
ALTER TABLE projects
  ADD COLUMN description TEXT NOT NULL DEFAULT '',
  ADD COLUMN tech_stack TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN url TEXT;
