import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : new URL(request.url).origin;
  const onboardingUrl = new URL(`${baseUrl}/onboarding`);
  onboardingUrl.searchParams.set("afterAuth", "1");
  if (next === "link") onboardingUrl.searchParams.set("intent", "link");
  if (code) onboardingUrl.searchParams.set("code", code);
  if (error) onboardingUrl.searchParams.set("authError", error);
  if (errorCode) onboardingUrl.searchParams.set("authErrorCode", errorCode);
  if (errorDescription) onboardingUrl.searchParams.set("authErrorDescription", errorDescription);
  return NextResponse.redirect(onboardingUrl.toString());
}
