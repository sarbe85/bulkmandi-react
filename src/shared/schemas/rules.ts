import { z } from 'zod';

// ========== STRING RULES ==========
export const minLengthRule = (min: number) =>
  z.string().min(min, `Must be at least ${min} characters`);

export const maxLengthRule = (max: number) =>
  z.string().max(max, `Cannot exceed ${max} characters`);

export const lengthRule = (min: number, max: number) =>
  z
    .string()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Cannot exceed ${max} characters`);

export const stringRule = (minLength = 1, maxLength?: number) => {
  let schema = z.string().min(minLength);
  if (maxLength) schema = schema.max(maxLength);
  return schema;
};

export const requiredRule = z.string().min(1, 'This field is required');

// ========== EMAIL & PHONE RULES ==========
export const emailRule = z
  .string()
  .email('Invalid email address');

export const mobileRule = (digits = 10) =>
  z
    .string()
    .regex(
      new RegExp(`^[0-9]{${digits}}$`),
      `Must be ${digits} digits`
    );

// ========== REGEX RULES ==========
export const regexRule = (pattern: RegExp, message: string) =>
  z.string().regex(pattern, message);

export const gstinRule = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z0-9][A-Z0-9]$/,
    'Invalid GSTIN format'
  );

export const panRule = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format');

export const ifscRule = z
  .string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format');

export const pincodeRule = (digits = 6) =>
  z
    .string()
    .regex(
      new RegExp(`^[0-9]{${digits}}$`),
      `Must be ${digits} digits`
    );

export const accountNumberRule = z
  .string()
  .min(9, 'Must be at least 9 digits')
  .max(18, 'Cannot exceed 18 digits');

// ========== DATE RULES ==========
export const dateRule = z
  .string()
  .refine((val) => {
    const date = new Date(val);
    return date <= new Date();
  }, 'Cannot be in the future');

// ========== ENUM/SELECT RULES ==========
export const enumRule = (values: string[]) =>
  z.enum(values as [string, ...string[]]);

// ========== ARRAY RULES ==========
export const arrayRule = (minItems = 1, maxItems?: number) => {
  let schema = z
    .array(z.string())
    .min(minItems, `At least ${minItems} item(s) required`);
  if (maxItems) {
    schema = schema.max(maxItems, `Maximum ${maxItems} items allowed`);
  }
  return schema;
};

// ========== OPTIONAL VERSION ==========
export const optionalString = (rule: z.ZodSchema) => rule.optional();
