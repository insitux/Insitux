import { invoke } from ".";
import { getTimeMs, padEnd, slen, substr, trimStart } from "./poly-fills";
import { Ctx } from "./types";

export type InvokeOutput = {
  type: "message" | "error";
  text: string;
}[];

const invocations = new Map<string, string>();
export const parensRx = /[\[\]\(\) ,]/;

export function invoker(ctx: Ctx, code: string): InvokeOutput {
  const uuid = getTimeMs().toString();
  invocations.set(uuid, code);
  const valOrErrs = invoke(ctx, code, uuid, true);
  if (valOrErrs.kind !== "errors") {
    return [];
  }
  let out: InvokeOutput = [];
  valOrErrs.errors.forEach(({ e, m, errCtx: { line, col, sourceId } }) => {
    const invocation = invocations.get(sourceId);
    if (!invocation) {
      out.push({
        type: "message",
        text: `${e} Error: line ${line} col ${col}: ${m}\n`,
      });
      return;
    }
    const lineText = invocation.split("\n")[line - 1];
    const sym = substr(lineText, col - 1).split(parensRx)[0];
    const half1 = trimStart(substr(lineText, 0, col - 1));
    out.push({ type: "message", text: padEnd(`${line}`, 4) + half1 });
    if (!sym) {
      const half2 = substr(lineText, col);
      out.push({ type: "error", text: lineText[col - 1] });
      out.push({ type: "message", text: `${half2}\n` });
    } else {
      const half2 = substr(lineText, col - 1 + slen(sym));
      out.push({ type: "error", text: sym });
      out.push({ type: "message", text: `${half2}\n` });
    }
    out.push({ type: "message", text: `${e} Error: ${m}.\n` });
  });
  return out;
}
