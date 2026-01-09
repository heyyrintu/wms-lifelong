import { z } from "zod";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const locationCodeSchema = z
  .string()
  .min(1, "Location code is required")
  .max(50, "Location code must be 50 characters or less")
  .trim()
  .toUpperCase();

export const skuCodeSchema = z
  .string()
  .min(1, "EAN code is required")
  .max(100, "EAN code must be 100 characters or less")
  .trim()
  .toUpperCase();

export const quantitySchema = z
  .number({ invalid_type_error: "Quantity must be a number" })
  .int("Quantity must be a whole number")
  .positive("Quantity must be positive");

export const optionalQuantitySchema = z
  .number({ invalid_type_error: "Quantity must be a number" })
  .int("Quantity must be a whole number")
  .nonnegative("Quantity cannot be negative");

// ============================================================================
// PUTAWAY SCHEMAS
// ============================================================================

export const putawayItemSchema = z.object({
  skuCode: skuCodeSchema,
  itemCode: z.string().optional(),
  qty: quantitySchema,
});

export const putawaySchema = z.object({
  locationCode: locationCodeSchema,
  items: z
    .array(putawayItemSchema)
    .min(1, "At least one item is required"),
  user: z.string().min(1).default("system"),
  handlerName: z.string().optional(),
  note: z.string().optional(),
});

export type PutawayInput = z.infer<typeof putawaySchema>;
export type PutawayItem = z.infer<typeof putawayItemSchema>;

// ============================================================================
// MOVE / TRANSFER SCHEMAS
// ============================================================================

export const moveInventorySchema = z.object({
  fromLocationCode: locationCodeSchema,
  toLocationCode: locationCodeSchema,
  skuCode: skuCodeSchema,
  qty: quantitySchema,
  user: z.string().min(1).default("system"),
  handlerName: z.string().optional(),
  note: z.string().optional(),
}).refine(
  (data) => data.fromLocationCode !== data.toLocationCode,
  {
    message: "Source and destination locations must be different",
    path: ["toLocationCode"],
  }
);

export type MoveInventoryInput = z.infer<typeof moveInventorySchema>;

// ============================================================================
// LOOKUP SCHEMAS
// ============================================================================

export const lookupLocationSchema = z.object({
  locationCode: locationCodeSchema,
});

export const lookupSkuSchema = z.object({
  skuCode: skuCodeSchema,
});

export type LookupLocationInput = z.infer<typeof lookupLocationSchema>;
export type LookupSkuInput = z.infer<typeof lookupSkuSchema>;

// ============================================================================
// ADJUST SCHEMA
// ============================================================================

export const adjustInventorySchema = z.object({
  locationCode: locationCodeSchema,
  skuCode: skuCodeSchema,
  qty: z.number().int("Quantity must be a whole number"),
  user: z.string().min(1).default("system"),
  handlerName: z.string().optional(),
  note: z.string().min(1, "Adjustment note is required"),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface InventoryRecord {
  id: string;
  locationCode: string;
  skuCode: string;
  itemCode?: string | null;
  skuName?: string | null;
  qty: number;
  updatedAt: Date;
}

export interface LocationInventory {
  locationId: string;
  locationCode: string;
  items: Array<{
    skuId: string;
    skuCode: string;
    itemCode?: string | null;
    skuName?: string | null;
    qty: number;
  }>;
}

export interface SkuLocations {
  skuId: string;
  skuCode: string;
  itemCode?: string | null;
  skuName?: string | null;
  locations: Array<{
    locationId: string;
    locationCode: string;
    qty: number;
  }>;
  totalQty: number;
}

export interface MovementRecord {
  id: string;
  action: "PUTAWAY" | "MOVE" | "ADJUST";
  skuCode: string;
  itemCode?: string | null;
  skuName?: string | null;
  fromLocationCode?: string | null;
  toLocationCode?: string | null;
  qty: number;
  user: string;
  handlerName?: string | null;
  note?: string | null;
  createdAt: Date;
}
