import { redirect } from "next/navigation";
import { getAddPropertyRedirectPath } from "./routing-utils";

export default async function AddPropertyEntryPage() {
  const path = await getAddPropertyRedirectPath();
  redirect(path);
}
