## ADDED Requirements

### Requirement: v2 section order for decision makers

The `/ja/cyber/` page MUST present sections in decision order:
hero / intro / features / issue / fact / start / FAQ / close.

#### Scenario: Executive scans the page top to bottom

- **WHEN** a reader scrolls from the hero to the close
- **THEN** sections appear in the order above, with features before issue and fact after issue

### Requirement: Spec-fixed experiment numbers

fact MUST show only the spec-confirmed generation: Opus 4.8 main band (5/5 to review),
6-model sub band (18 breakthroughs to 0, Fable 5 excluded with a note),
Opus 5-row comparison table, and the `$67,800` to 403 probe folded in a disclosure.

#### Scenario: Reader checks the numbers against the sources

- **WHEN** a reader compares fact figures with `example-cyber-attack` main and the TechTouch survey
- **THEN** Opus reads 5/5 to 5/5, the sub band reads 18 to 0 with the Fable 5 exclusion note,
  the probe reads `$67,800` to 403, and no `$28K` / `$1M` / 96% / 7兆円 figures appear

### Requirement: Merged product naming

The page MUST sell ProofGate as one product. Interlock / ToolGuard split naming,
the two-axis intro, and the pre_tool_call boundary explanation do not appear.

#### Scenario: Reader looks for product names

- **WHEN** a reader reads hero, intro, features, and close copy
- **THEN** no Interlock / ToolGuard / pre_tool_call terms appear in page copy
