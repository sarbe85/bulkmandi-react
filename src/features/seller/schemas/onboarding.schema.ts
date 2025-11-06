import {
  emailRule,
  gstinRule,
  minLengthRule,
  mobileRule,
  panRule
} from '@/shared/schemas/rules';
import { z } from 'zod';

// ========== ORG KYC SCHEMA (SINGLE SOURCE OF TRUTH) ==========

const plantLocationSchema = z.object({
  id: z.string().optional(),
  street: z.string().optional(),
  name: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().optional(),
  pin: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
});

const contactPersonSchema = z.object({
  name: minLengthRule(2),
  email: emailRule,
  mobile: mobileRule(10),
  role: z.string().optional(),
});

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
});

// ========== BANK DETAILS SCHEMA (ALL FIELDS) ==========

export const bankDetailsSchema = z.object({
  // ← Form input fields
  accountNumber: minLengthRule(9),
  accountHolderName: minLengthRule(1),
  ifsc: z.string().length(11, 'IFSC must be 11 characters'),
  bankName: minLengthRule(3),
  branchName: z.string().optional(),

  isPennyDropVerified: z.boolean().optional(),
  pennyDropStatus: z.enum(['VERIFIED', 'PENDING', 'FAILED']).optional(),
  pennyDropScore: z.number().optional(),
  payoutMethod: z.string().optional(),
  upiDetails: z.string().optional(),
   documents: z.array(
    z.object({
      docType: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      uploadedAt: z.string(),
      status: z.enum(['UPLOADED', 'PENDING', 'VERIFIED', 'REJECTED']),
      comments: z.string().optional(),
    })
  ).optional()
});

// ========== COMPLIANCE DOCS SCHEMA ==========

export const complianceSchema = z.object({
  warrantyAssurance: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept warranty assurance',
    }),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept terms and conditions',
    }),
  amlCompliance: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must comply with AML regulations',
    }),
});


// ✅ AUTO-GENERATED TYPES (NO MANUAL INTERFACE NEEDED!)
export type OrgKycData = z.infer<typeof orgKycSchema>;
export type PlantLocation = z.infer<typeof plantLocationSchema>;
export type ContactPerson = z.infer<typeof contactPersonSchema>;

export type BankDetails = z.infer<typeof bankDetailsSchema>;

export type ComplianceData = z.infer<typeof complianceSchema>;
