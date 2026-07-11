export const fieldStates = ["EMPTY","USER_CONFIRMED","AI_PENDING","AI_CONFIRMED","USER_EDITED","UNABLE_TO_CONFIRM","CONFLICT"] as const;
export type FieldState = typeof fieldStates[number];
export const evidenceSupportStates = ["DIRECT","PARTIAL","USER_STATEMENT","NONE","CONFLICT"] as const;
export type EvidenceSupportState = typeof evidenceSupportStates[number];

export interface CaseDetailField { value: unknown; state: FieldState; evidenceSupport: EvidenceSupportState; savedAt?: string }

export function normalizeField(field: {value?:unknown;state?:string;evidenceSupport?:string;savedAt?:string}|undefined): CaseDetailField {
  const value = field?.value ?? null;
  const legacy: Record<string,FieldState> = { CONFIRMED:"USER_CONFIRMED", PENDING:value===null?"EMPTY":"USER_CONFIRMED", UNKNOWN:"UNABLE_TO_CONFIRM" };
  const state = fieldStates.includes(field?.state as FieldState) ? field!.state as FieldState : legacy[field?.state ?? ""] ?? (value===null?"EMPTY":"USER_CONFIRMED");
  const support = evidenceSupportStates.includes(field?.evidenceSupport as EvidenceSupportState) ? field!.evidenceSupport as EvidenceSupportState : value===null?"NONE":"USER_STATEMENT";
  return { value, state, evidenceSupport:support, ...(field?.savedAt?{savedAt:field.savedAt}:{}) };
}

export function normalizeDetails(details: Record<string,{value?:unknown;state?:string;evidenceSupport?:string;savedAt?:string}>): Record<string,CaseDetailField> {
  return Object.fromEntries(Object.entries(details).map(([key,field])=>[key,normalizeField(field)]));
}

export function isConfirmedField(state: string): boolean {
  return ["USER_CONFIRMED","AI_CONFIRMED","USER_EDITED","CONFIRMED"].includes(state);
}
