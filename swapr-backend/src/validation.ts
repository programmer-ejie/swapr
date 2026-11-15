import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues
        .map((i) => `${i.path.join('.') || 'request'}: ${i.message}`)
        .join('; '),
    );
  }
  return result.data;
}

export const uuid = z.string().uuid();
const text = (max: number) => z.string().trim().max(max);
export const email = z.string().trim().toLowerCase().email().max(254);
export const credentials = z
  .object({ email, password: z.string().min(8).max(128) })
  .strict();
export const image = z
  .string()
  .max(2800000)
  .refine((value) => {
    if (value === '') return true;
    if (/^https:\/\/i\.ibb\.co\/[A-Za-z0-9/_\-.]+$/.test(value)) return true;
    const match =
      /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
    if (!match) return false;
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 2 * 1024 * 1024) return false;
    if (match[1] === 'png')
      return bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (match[1] === 'jpeg')
      return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    return (
      bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP'
    );
  }, 'Use a PNG, JPEG or WebP image up to 2 MB.');
export const profile = z
  .object({
    firstname: text(80).min(1).optional(),
    middlename: text(80).optional(),
    lname: text(80).min(1).optional(),
    age: z.number().int().min(1).max(120).optional(),
    gender: text(50).optional(),
    birthdate: z.iso
      .date()
      .refine(
        (d) => d <= new Date().toISOString().slice(0, 10),
        'Birthday cannot be in the future.',
      )
      .optional(),
    placeOfBirth: text(160).optional(),
    newUser: z.boolean().optional(),
    profilePicUrl: image.optional(),
    description: text(2000).optional(),
  })
  .strict();
export const listing = z
  .object({
    name: text(160).min(1),
    description: text(4000).default(''),
    category: text(80).min(1),
    price: z
      .number()
      .finite()
      .min(0)
      .max(9999999999.99)
      .refine(
        (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.0001,
        'Use at most two decimal places.',
      ),
    quantity: z.number().int().min(1).max(100000),
    condition: z.enum([
      'Like new',
      'Excellent',
      'Good',
      'Used',
      'New open box',
    ]),
    location: text(160).min(1),
    image: image.default(''),
    status: z.enum(['live', 'draft']).default('live'),
  })
  .strict();
export const shop = z
  .object({ name: text(120), city: text(160), description: text(2000) })
  .strict();
export const meetup = z
  .object({
    location: text(200).min(1),
    scheduledAt: z.iso
      .datetime({ offset: true })
      .refine((d) => Date.parse(d) > Date.now(), 'Choose a future date.'),
    agreedPrice: z.number().finite().min(0).max(9999999999.99),
  })
  .strict();
