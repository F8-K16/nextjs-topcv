export type ParsedJobDescription =
  | {
      kind: "v1";
      mota: string;
      yeucau: string;
      quyenloi: string;
    }
  | { kind: "plain"; text: string };

const MARKER = "<<<JOB_BLOCK_V1>>>";
const YC = "\n---YC---\n";
const QL = "\n---QL---\n";

export function parseJobDescription(raw: string): ParsedJobDescription {
  if (!raw.startsWith(MARKER)) {
    return { kind: "plain", text: raw };
  }
  const body = raw.slice(MARKER.length).trimStart();
  const iYc = body.indexOf(YC);
  const iQl = body.indexOf(QL);
  if (iYc === -1 || iQl === -1 || iQl <= iYc) {
    return { kind: "plain", text: raw };
  }
  const mota = body.slice(0, iYc).trim();
  const yeucau = body.slice(iYc + YC.length, iQl).trim();
  const quyenloi = body.slice(iQl + QL.length).trim();
  return { kind: "v1", mota, yeucau, quyenloi };
}
