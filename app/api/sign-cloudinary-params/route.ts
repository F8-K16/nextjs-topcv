import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  if (!paramsToSign || typeof paramsToSign !== "object") {
    return Response.json({ error: "paramsToSign required" }, { status: 400 });
  }

  const secret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Missing CLOUDINARY_API_SECRET" },
      { status: 500 },
    );
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);

  return Response.json({ signature });
}
