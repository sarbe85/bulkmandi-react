// src/features/buyer/schemas/onboarding.schema.ts

import { emailRule, gstinRule, minLengthRule, mobileRule, panRule } from '@/shared/schemas/rules';
import { z } from 'zod';

// ========== CONTACT PERSON SCHEMA ==========
const contactPersonSchema = z.object({
  name: minLengthRule(2),
  email: emailRule,
  mobile: mobileRule(10),
  role: z.string().optional(),
});

// ========== PLANT LOCATION SCHEMA ==========
export const plantLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Plant name required'),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default('India'),
  isActive: z.boolean().default(true),
});

// ========== ORG KYC SCHEMA ==========
export const orgKycSchema = z.object({
  legalName: minLengthRule(2),
  tradeName: z.string().optional(),
  gstin: gstinRule,
  pan: panRule,
  cin: z.string().optional(),
  registeredAddress: minLengthRule(10),
  businessType: minLengthRule(2),
  incorporationDate: z.string().min(1, 'Incorporation date is required'),
  plantLocations: z.array(plantLocationSchema).optional(),
  primaryContact: contactPersonSchema,
  secondaryContact: contactPersonSchema.optional(), // ← NEW (buyer-specific)
});

export type OrgKycFormData = z.infer<typeof orgKycSchema>;
export type ContactPerson = z.infer<typeof contactPersonSchema>;
export type PlantLocation = z.infer<typeof plantLocationSchema>;

// ========== BANK DETAILS SCHEMA ==========
export const bankDetailsSchema = z
  .object({
    accountNumber: minLengthRule(9),
    accountHolderName: minLengthRule(1),
    accountType: z.enum(['SAVINGS', 'CURRENT', 'OVERDRAFT'], {
      required_error: 'Account type is required',
    }),
    ifsc: z.string().length(11, 'IFSC must be 11 characters'),
    bankName: minLengthRule(3),
    branchName: z.string().optional(),
    payoutMethod: z.enum(['RTGS', 'NEFT', 'UPI'], {
      required_error: 'Payout method is required',
    }),
    upiDetails: z.string().optional(),
    isPennyDropVerified: z.boolean().optional(),
    pennyDropStatus: z.enum(['VERIFIED', 'PENDING', 'FAILED']).optional(),
    pennyDropScore: z.number().optional(),
    documents: z
      .array(
        z.object({
          docType: z.string(),
          fileName: z.string(),
          fileUrl: z.string(),
          uploadedAt: z.string(),
          status: z.enum(['UPLOADED', 'PENDING', 'VERIFIED', 'REJECTED']),
          comments: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.payoutMethod === 'UPI') return !!data.upiDetails;
      return true;
    },
    {
      message: 'UPI Details are required when payout method is UPI',
      path: ['upiDetails'],
    }
  );

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

// ========== COMPLIANCE DOCS SCHEMA ==========
export const complianceSchema = z.object({
  warrantyAssurance: z.boolean().refine((val) => val === true, {
    message: 'You must accept warranty assurance',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions',
  }),
  amlCompliance: z.boolean().refine((val) => val === true, {
    message: 'You must comply with AML regulations',
  }),
});

export type ComplianceFormData = z.infer<typeof complianceSchema>;

// ========== BUYER PREFERENCES SCHEMA (NEW ⭐) ==========
export const buyerPreferencesSchema = z.object({
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  typicalMonthlyVolumeMT: z.number().min(0).optional(),
  incoterms: z
    .array(z.enum(['DAP', 'EXW', 'FCA', 'CPT', 'CIP', 'DDP']))
    .min(1, 'Select at least one incoterm'),
  deliveryPins: z
    .array(z.string().regex(/^[0-9]{6}$/, 'Invalid PIN'))
    .min(1, 'Add at least one delivery PIN'),
  acceptanceWindow: z.enum(['24h', '48h', '72h']),
  qcRequirement: z.enum(['VISUAL_WEIGHT', 'LAB_REQUIRED']),
  notifyEmail: z.boolean().optional(),
  notifySMS: z.boolean().optional(),
  notifyWhatsApp: z.boolean().optional(),
  notes: z.string().optional(),
});

export type BuyerPreferencesFormData = z.infer<typeof buyerPreferencesSchema>;

// ========== SUBMIT SCHEMA ==========
export const submitSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms',
  }),
  dataAccuracyConfirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm data accuracy',
  }),
});

export type SubmitFormData = z.infer<typeof submitSchema>;
