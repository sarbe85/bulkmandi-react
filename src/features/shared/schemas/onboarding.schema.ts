// ============================================
// UNIFIED ZODO SCHEMAS (MATCHES SELLER SCHEMA)
// ============================================

import { emailRule, gstinRule, minLengthRule, mobileRule, panRule } from "@/shared/schemas/rules";
import { z } from "zod";

// ========== SHARED SCHEMAS ==========

export const contactPersonSchema = z.object({
  name: minLengthRule(2),
  email: emailRule,
  mobile: mobileRule(10),
  role: z.string().optional(),
});

export const plantLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Plant name required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().optional(),
  country: z.string().default("India"),
  isActive: z.boolean().default(true),
  street: z.string().optional(),
  gstStateCode: z.string().optional(),
});

// ========== ORG KYC SCHEMA (ALL ROLES) ==========
export const orgKycSchema = z.object({
  legalName: minLengthRule(2),
  tradeName: z.string().optional(),
  gstin: gstinRule,
  pan: panRule,
  cin: z.string().optional(),
  registeredAddress: minLengthRule(10),
  businessType: minLengthRule(2),
  incorporationDate: z.string().optional(),
  primaryContact: contactPersonSchema,
  secondaryContact: contactPersonSchema.optional(), // Buyer-specific but optional
  plantLocations: z.array(plantLocationSchema).optional(),
});

export type OrgKycFormData = z.infer<typeof orgKycSchema>;
export type ContactPerson = z.infer<typeof contactPersonSchema>;
export type PlantLocation = z.infer<typeof plantLocationSchema>;

// ========== BANK DETAILS SCHEMA (ALL ROLES) ==========
export const bankDetailsSchema = z
  .object({
    accountNumber: minLengthRule(9),
    accountHolderName: minLengthRule(1),
    accountType: z.enum(["SAVINGS", "CURRENT", "OVERDRAFT"], {
      required_error: "Account type is required",
    }),
    ifsc: z.string().length(11, "IFSC must be 11 characters"),
    bankName: minLengthRule(3),
    branchName: z.string().optional(),
    payoutMethod: z.enum(["RTGS", "NEFT", "UPI"], {
      required_error: "Payout method is required",
    }),
    upiDetails: z.string().optional(),
    isPennyDropVerified: z.boolean().optional(),
    pennyDropStatus: z.enum(["VERIFIED", "PENDING", "FAILED"]).optional(),
    pennyDropScore: z.number().optional(),
    documents: z
      .array(
        z.object({
          docType: z.string(),
          fileName: z.string(),
          fileUrl: z.string(),
          uploadedAt: z.string(),
          status: z.enum(["UPLOADED", "PENDING", "VERIFIED", "REJECTED"]),
          comments: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.payoutMethod === "UPI") return !!data.upiDetails;
      return true;
    },
    {
      message: "UPI Details are required when payout method is UPI",
      path: ["upiDetails"],
    }
  );

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

// ========== COMPLIANCE SCHEMA (ALL ROLES) ==========
// Form-only schema (for react-hook-form validation)
export const complianceDeclarationsSchema = z.object({
  warrantyAssurance: z.boolean().refine((val) => val === true, {
    message: "You must accept warranty assurance",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept terms and conditions",
  }),
  amlCompliance: z.boolean().refine((val) => val === true, {
    message: "You must comply with AML regulations",
  }),
});

// Full compliance schema (for API submission)
export const complianceSchema = z.object({
  documents: z.array(
    z.object({
      docType: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      uploadedAt: z.string(),
      status: z.enum(["UPLOADED", "PENDING", "VERIFIED", "REJECTED"]),
    })
  ),
  warrantyAssurance: z.boolean().refine((val) => val === true, {
    message: "You must accept warranty assurance",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept terms and conditions",
  }),
  amlCompliance: z.boolean().refine((val) => val === true, {
    message: "You must comply with AML regulations",
  }),
});

export type ComplianceFormData = z.infer<typeof complianceSchema>;
export type ComplianceDeclarationsFormData = z.infer<typeof complianceDeclarationsSchema>;

// ========== BUYER PREFERENCES SCHEMA (BUYER ONLY) ==========
export const buyerPreferencesSchema = z.object({
  categories: z.array(z.string()).min(1, "Select at least one category"),
  typicalMonthlyVolumeMT: z.number().min(0).optional(),
  incoterms: z.array(z.string()).min(1, "Select at least one incoterm"),
  deliveryPins: z.array(z.string().regex(/^[0-9]{6}$/, "Invalid PIN")).min(1, "Add at least one delivery PIN"),
  acceptanceWindow: z.enum(["24 hours", "48 hours", "72 hours"]),
  qcRequirement: z.enum(["VISUAL_WEIGHT", "LAB_REQUIRED"]),
  notifications: z.array(z.string()).min(1, "Select at least one notification channel"),
  notes: z.string().optional(),
});

export type BuyerPreferencesFormData = z.infer<typeof buyerPreferencesSchema>;

// ========== CATALOG SCHEMA (SELLER ONLY) ==========
export const daysEnum = z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

export const priceFloorSchema = z.object({
  category: z.string().min(1, "Category is required"),
  pricePerMT: z.number().min(0, "Price must be zero or more"),
});

export const catalogProductSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Category name is required"),
  isSelected: z.boolean().default(true),
  grades: z.array(z.string()).default([]),
  moqPerOrder: z.number().min(1, "MOQ per order must be at least 1").default(100),
  stdLeadTime: z.number().min(1, "Standard lead time must be at least 1").default(5),
  availability: z.array(z.string()).default([]).optional(),
});

export const logisticsPreferenceSchema = z.object({
  usePlatform3PL: z.boolean().default(true),
  selfPickupAllowed: z.boolean().default(true),
});

export const catalogSchema = z.object({
  catalog: z.array(catalogProductSchema).default([]),
  priceFloors: z.array(priceFloorSchema).default([]),
  plantLocations: z.array(plantLocationSchema).default([]),
  logisticsPreference: logisticsPreferenceSchema.optional(),
});

export type CatalogFormData = z.infer<typeof catalogSchema>;
export type CatalogProductFormData = z.infer<typeof catalogProductSchema>;
export type PriceFloorFormData = z.infer<typeof priceFloorSchema>;

// ========== SUBMIT SCHEMA ==========
export const submitSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, "Must accept terms"),
  dataAccuracyConfirmed: z.boolean().refine((val) => val === true, "Must confirm accuracy"),
  agreeToCreditCheck: z.boolean().optional(),
  additionalRemarks: z.string().optional(),
});

export type SubmitFormData = z.infer<typeof submitSchema>;
