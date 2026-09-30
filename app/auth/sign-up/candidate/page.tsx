import { redirect } from "next/navigation";

export default function CandidateSignupRedirectPage() {
  redirect("/auth/sign-up");
}
