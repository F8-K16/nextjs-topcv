"use client";

import { CldUploadButton, type CldUploadButtonProps } from "next-cloudinary";

function UploadButton(props: CldUploadButtonProps) {
  return <CldUploadButton {...props} />;
}

export default UploadButton;
