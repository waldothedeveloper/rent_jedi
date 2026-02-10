"server only";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifySessionDAL } from "@/dal/shared-dal-helpers";

type CreateOrganizationResult =
  | {
      success: true;
      message: string;
      organizationId: string;
      name: string;
      slug: string;
    }
  | { success: false; message: string };

export async function createOrganizationDAL(): Promise<CreateOrganizationResult> {
  const session = await verifySessionDAL();

  if (!session) {
    return {
      success: false,
      message: "You must be logged in to create an organization.",
    };
  }

  const id = crypto.randomUUID();
  const name = `org-${id}`;
  const slug = `org-${id}`;

  try {
    const org = await auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    });

    if (!org) {
      return {
        success: false,
        message: "Failed to create organization. Please try again.",
      };
    }

    return {
      success: true,
      message: "Organization created successfully.",
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
    };
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status);
      switch (error.status) {
        case "UNAUTHORIZED":
          return {
            success: false,
            message: "You are not authorized to create an organization.",
          };
        case "BAD_REQUEST":
          return {
            success: false,
            message: "Invalid organization data provided.",
          };
        default:
          return {
            success: false,
            message: error.message || "Failed to create organization.",
          };
      }
    }
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
