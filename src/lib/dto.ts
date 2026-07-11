import { z } from "zod";
import type { CaseRow } from "@/server/cases";
import type { EvidenceRow } from "@/server/storage";
import type { ExtractionRow } from "@/server/extraction";
import type { TimelineRow } from "@/server/timeline";
import type { MatrixRow } from "@/server/matrix";
import type { MaterialGap } from "@/lib/gaps";
import type { GeneratedRow } from "@/server/export";
import type { PlanRow,OrderRow } from "@/server/plans";
import type { UserOption } from "@/server/backoffice";

const iso=z.string().datetime();const nullableString=z.string().nullable();
export const caseDtoSchema=z.object({id:z.string(),ownerId:z.string(),assignedReviewerId:nullableString,title:z.string(),disputeType:z.string(),status:z.string(),detailsJson:z.string(),timelineConfirmedAt:nullableString,isDemo:z.boolean(),demoTemplateKey:nullableString,demoSetupState:z.string(),createdAt:iso,updatedAt:iso}).strict();
export type CaseDTO=z.infer<typeof caseDtoSchema>;
export const evidenceFileDtoSchema=z.object({id:z.string(),caseId:z.string(),originalName:z.string(),mimeType:z.string(),byteSize:z.number().int().nonnegative(),category:z.string(),status:z.string(),createdAt:iso}).strict();
export type EvidenceFileDTO=z.infer<typeof evidenceFileDtoSchema>;
export const extractedFieldDtoSchema=z.object({id:z.string(),evidenceId:z.string(),fieldName:z.string(),originalValueJson:nullableString,confirmedValueJson:nullableString,sourceLocator:z.string(),confidence:z.number(),needsReview:z.number().int(),state:z.string(),confirmedAt:nullableString,createdAt:iso}).strict();
export type ExtractedFieldDTO=z.infer<typeof extractedFieldDtoSchema>;
export const timelineEventDtoSchema=z.object({id:z.string(),eventDate:nullableString,dateEnd:nullableString,description:z.string(),eventType:z.string(),amountCents:z.number().int().nullable(),sourceType:z.string(),isUserStatement:z.boolean(),isConfirmed:z.boolean(),sortOrder:z.number().int(),evidenceIds:z.array(z.string()),createdAt:iso}).strict();
export type TimelineEventDTO=z.infer<typeof timelineEventDtoSchema>;
export const claimEvidenceLinkDtoSchema=z.object({id:z.string(),claim:z.string(),claimType:z.string(),sufficiency:z.string(),missingMaterials:z.array(z.string()),confirmationState:z.string(),notes:z.string(),evidenceIds:z.array(z.string()),createdAt:iso}).strict();
export type ClaimEvidenceLinkDTO=z.infer<typeof claimEvidenceLinkDtoSchema>;
export const missingMaterialDtoSchema=z.object({code:z.string(),priority:z.enum(["PRIORITY","OPTIONAL","UNKNOWN"]),title:z.string(),recommendation:z.string(),basis:z.string()}).strict();
export type MissingMaterialDTO=z.infer<typeof missingMaterialDtoSchema>;
export const generatedDocumentDtoSchema=z.object({id:z.string(),kind:z.string(),fileName:z.string(),byteSize:z.number().int().nonnegative(),createdAt:iso}).strict();
export type GeneratedDocumentDTO=z.infer<typeof generatedDocumentDtoSchema>;
export const planDtoSchema=z.object({id:z.string(),code:z.string(),name:z.string(),description:z.string(),limitations:z.string(),active:z.boolean()}).strict();export type PlanDTO=z.infer<typeof planDtoSchema>;
export const orderDtoSchema=z.object({id:z.string(),caseId:z.string(),planId:z.string(),planName:z.string(),status:z.string(),activationMethod:z.string(),createdAt:iso}).strict();export type OrderDTO=z.infer<typeof orderDtoSchema>;
export const userOptionDtoSchema=z.object({id:z.string(),email:z.string(),displayName:z.string(),role:z.string()}).strict();export type UserOptionDTO=z.infer<typeof userOptionDtoSchema>;

function toIso(value:string|Date):string{return value instanceof Date?value.toISOString():new Date(value).toISOString();}
export function toClientScalar(value:unknown):string|number|boolean|null{if(value===null||typeof value==="string"||typeof value==="boolean")return value;if(typeof value==="number"){if(!Number.isFinite(value))throw new TypeError("Non-finite number is not serializable");return value;}if(typeof value==="bigint")return value<=BigInt(Number.MAX_SAFE_INTEGER)&&value>=BigInt(Number.MIN_SAFE_INTEGER)?Number(value):value.toString();if(value instanceof Date)return value.toISOString();if(Buffer.isBuffer(value))throw new TypeError("Buffer must not cross the client boundary");if(typeof value==="object"&&value?.constructor?.name==="Decimal"&&"toString"in value)return String(value);throw new TypeError("Unsupported client scalar");}
export const toCaseDTO=(row:CaseRow):CaseDTO=>caseDtoSchema.parse({id:String(row.id),ownerId:String(row.ownerId),assignedReviewerId:row.assignedReviewerId===null?null:String(row.assignedReviewerId),title:String(row.title),disputeType:String(row.disputeType),status:String(row.status),detailsJson:String(row.detailsJson),timelineConfirmedAt:row.timelineConfirmedAt===null?null:toIso(row.timelineConfirmedAt),isDemo:Boolean(row.isDemo),demoTemplateKey:row.demoTemplateKey===null?null:String(row.demoTemplateKey),demoSetupState:String(row.demoSetupState),createdAt:toIso(row.createdAt),updatedAt:toIso(row.updatedAt)});
export const toEvidenceFileDTO=(row:EvidenceRow):EvidenceFileDTO=>evidenceFileDtoSchema.parse({id:String(row.id),caseId:String(row.caseId),originalName:String(row.originalName),mimeType:String(row.mimeType),byteSize:Number(row.byteSize),category:String(row.category),status:String(row.status),createdAt:toIso(row.createdAt)});
export const toExtractedFieldDTO=(row:ExtractionRow):ExtractedFieldDTO=>extractedFieldDtoSchema.parse({id:String(row.id),evidenceId:String(row.evidenceId),fieldName:String(row.fieldName),originalValueJson:row.originalValueJson,confirmedValueJson:row.confirmedValueJson,sourceLocator:String(row.sourceLocator),confidence:Number(row.confidence),needsReview:Number(row.needsReview),state:String(row.state),confirmedAt:row.confirmedAt===null?null:toIso(row.confirmedAt),createdAt:toIso(row.createdAt)});
export const toTimelineEventDTO=(row:TimelineRow):TimelineEventDTO=>timelineEventDtoSchema.parse({id:String(row.id),eventDate:row.eventDate,dateEnd:row.dateEnd,description:String(row.description),eventType:String(row.eventType),amountCents:row.amountCents===null?null:Number(row.amountCents),sourceType:String(row.sourceType),isUserStatement:Boolean(row.isUserStatement),isConfirmed:Boolean(row.isConfirmed),sortOrder:Number(row.sortOrder),evidenceIds:row.evidenceIds.map(String),createdAt:toIso(row.createdAt)});
export const toClaimEvidenceLinkDTO=(row:MatrixRow):ClaimEvidenceLinkDTO=>claimEvidenceLinkDtoSchema.parse({id:String(row.id),claim:String(row.claim),claimType:String(row.claimType),sufficiency:String(row.sufficiency),missingMaterials:row.missingMaterials.map(String),confirmationState:String(row.confirmationState),notes:String(row.notes),evidenceIds:row.evidenceIds.map(String),createdAt:toIso(row.createdAt)});
export const toMissingMaterialDTO=(row:MaterialGap):MissingMaterialDTO=>missingMaterialDtoSchema.parse({code:String(row.code),priority:row.priority,title:String(row.title),recommendation:String(row.recommendation),basis:String(row.basis)});
export const toGeneratedDocumentDTO=(row:GeneratedRow):GeneratedDocumentDTO=>generatedDocumentDtoSchema.parse({id:String(row.id),kind:String(row.kind),fileName:String(row.fileName),byteSize:Number(row.byteSize),createdAt:toIso(row.createdAt)});
export const toPlanDTO=(row:PlanRow):PlanDTO=>planDtoSchema.parse({id:String(row.id),code:String(row.code),name:String(row.name),description:String(row.description),limitations:String(row.limitations),active:Boolean(row.active)});
export const toOrderDTO=(row:OrderRow):OrderDTO=>orderDtoSchema.parse({id:String(row.id),caseId:String(row.caseId),planId:String(row.planId),planName:String(row.planName),status:String(row.status),activationMethod:String(row.activationMethod),createdAt:toIso(row.createdAt)});
export const toUserOptionDTO=(row:UserOption):UserOptionDTO=>userOptionDtoSchema.parse({id:String(row.id),email:String(row.email),displayName:String(row.displayName),role:String(row.role)});
