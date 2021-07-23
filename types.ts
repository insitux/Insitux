type Vec3 = [number, number, number];
type ExternalValue = null | string | number | boolean | Vec3;
type Typ = "null" | "str" | "num" | "bool" | "vec3" | "func";
type Val = { v: ExternalValue | Func; t: Typ };

type InvokeError = [string, string, number, number];
type ExternalError = null | string;
type ValAndErr = { value: ExternalValue; error: ExternalError };

type FuncName = "print" | "print-line" | string;

type Func = {
  name: string;
  params: string[];
  ins: Ins[];
};
type Funcs = { [key: string]: Func };
type Env = {
  funcs: Funcs;
  vars: { [key: string]: Val };
};

type Ctx = {
  set: (key: string, val: ExternalValue) => Promise<ExternalError>;
  get: (key: string) => Promise<ValAndErr>;
  exe: (name: FuncName, args: ExternalValue[]) => Promise<ValAndErr>;
  env: Env;
};

type InsType = "num" | "str" | "var" | "op" | "exe" | "if" | "els" | "ret";
type Ins = {
  type: InsType;
  value?: any;
  line: number;
  col: number;
};
