"use server";

import {
  activateTenantDraftDAL,
  createTenantDraftDAL,
  getTenantByIdDAL,
  listTenantsDAL,
  updateTenantDraftDAL,
} from "@/dal/tenants";
import {
  leaseDatesSchema,
  tenantBasicInfoSchema,
  unitSelectionSchema,
} from "@/utils/shared-schemas";

import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Step 1: Create tenant draft with basic info
 */
export async function createTenantDraft(
  input: z.infer<typeof tenantBasicInfoSchema>
) {
  const { success, data, error } = tenantBasicInfoSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  const name = `${data.firstName} ${data.lastName}`.trim();

  const result = await createTenantDraftDAL({
    name,
    email: data.email ?? null,
    phone: data.phone ?? null,
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/owners/tenants/add-tenant");

  return {
    success: true,
    tenantId: result.data?.id,
    message: "Tenant created successfully!",
  };
}

/**
 * Step 1 (Edit): Update tenant draft with basic info
 */
export async function updateTenantDraftBasicInfo(
  tenantId: string,
  input: z.infer<typeof tenantBasicInfoSchema>
) {
  const { success, data, error } = tenantBasicInfoSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  const name = `${data.firstName} ${data.lastName}`.trim();

  const result = await updateTenantDraftDAL(tenantId, {
    name,
    email: data.email ?? null,
    phone: data.phone ?? null,
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/owners/tenants/add-tenant");

  return {
    success: true,
    message: "Tenant information updated successfully!",
  };
}

/**
 * Step 2: Update draft with lease dates
 */
export async function updateTenantDraftLeaseDates(
  tenantId: string,
  input: z.infer<typeof leaseDatesSchema>
) {
  const { success, data, error } = leaseDatesSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  // Parse date string as UTC midnight
  const parseAsUTC = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const result = await updateTenantDraftDAL(tenantId, {
    leaseStartDate: parseAsUTC(data.leaseStartDate),
    leaseEndDate: data.leaseEndDate ? parseAsUTC(data.leaseEndDate) : null,
  });

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/owners/tenants/add-tenant");

  return {
    success: true,
    message: "Lease dates saved successfully!",
  };
}

/**
 * Step 3: Activate draft with unit assignment
 */
export async function activateTenantDraft(
  tenantId: string,
  input: z.infer<typeof unitSelectionSchema>
) {
  const { success, data, error } = unitSelectionSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  const result = await activateTenantDraftDAL(tenantId, data.unitId);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/owners/tenants");
  revalidatePath("/owners/properties");

  return {
    success: true,
    tenantId: result.data?.id,
    message: "Tenant created successfully!",
  };
}

/**
 * Get tenant for editing
 */
export async function getTenantForEdit(tenantId: string) {
  const result = await getTenantByIdDAL(tenantId);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return {
    success: true,
    tenant: result.data,
  };
}

/**
 * List all tenants for the current owner
 */
export async function listTenants() {
  const result = await listTenantsDAL();
  return result;
}
