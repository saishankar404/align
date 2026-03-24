import { cookies } from "next/headers";

export type IdentityMode = "cloud" | "local";

const MODE_KEY = "align_identity_mode";
const LOCAL_USER_ID_KEY = "align_local_user_id";

export function getServerIdentityMode(): IdentityMode {
  const cookieStore = cookies();
  const mode = cookieStore.get(MODE_KEY)?.value;
  if (mode === "local" || mode === "cloud") {
    return mode;
  }
  return "cloud";
}

export function hasServerLocalIdentity(): boolean {
  const cookieStore = cookies();
  return Boolean(cookieStore.get(LOCAL_USER_ID_KEY)?.value);
}
