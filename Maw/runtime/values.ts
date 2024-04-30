import { Stat } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "string" | "boolean" | "object" | "native-fn" | "function";

export interface RuntimeVal {
  type: ValueType;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL(): NullVal {
  return { value: null, type: "null" } as NullVal;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_STRING(n: string = ""): StringVal {
  return { value: n, type: "string" } as StringVal;
}

export function MK_NUMBER(n: number = 0): NumberVal {
  return { value: n, type: "number" } as NumberVal;
}

export interface BoolVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b: boolean = true): BoolVal {
  return { value: b, type: "boolean" } as BoolVal;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (
  args: RuntimeVal[],
  env: Environment
) => RuntimeVal;

export interface NativeFnValue extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall){
  return {type: "native-fn", call} as NativeFnValue
}

export interface FunctionValue extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stat[];
}
