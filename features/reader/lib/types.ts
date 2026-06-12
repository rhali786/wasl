// Reader modes — see docs/design-interaction.md.
// Study: tap demotes (Engine B, live) + tracks tapped ids for page-finish
// (Engine A). Mushaf: reveal only, never mutates status.
export type ReaderMode = "study" | "mushaf";
