import { run } from "../main.ts";
import {
  BoolVal,
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  NullVal,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "./values.ts";

function processObjectForPrint(obj: ObjectVal): any {
  const res = processMapForPrint(obj.properties);
  return res;
}

function processMapForPrint(obj: Map<string, RuntimeVal>): any {
  const result: any = {};
  obj.forEach((value, key) => {
    if (value instanceof Map) {
      result[key] = processMapForPrint(value);
    } else if (value.type == "object") {
      result[key] = processObjectForPrint(value as ObjectVal);
    } else if (value.type == "number") {
      result[key] = processNumberForPrint(value as NumberVal);
    } else if (value.type == "string") {
      result[key] = processStringForPrint(value as StringVal);
    } else if (value.type == "null") {
      result[key] = processNullForPrint(value as NullVal);
    } else if (value.type == "boolean") {
      result[key] = processBooleanForPrint(value as BoolVal);
    } else {
      result[key] = value;
    }
  });

  return result;
}

function processNumberForPrint(arg: NumberVal): number {
  return arg.value;
}

function processStringForPrint(arg: StringVal): string {
  return arg.value;
}

function processNullForPrint(arg: NullVal): null {
  return arg.value;
}

function processBooleanForPrint(arg: BoolVal): boolean {
  return arg.value;
}

export function createGlobalEnv() {
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  env.declareVar(
    "print",
    MK_NATIVE_FN((args, scope) => {
      args.forEach((arg) => {
        switch (arg.type) {
          case "number":
            console.log(processNumberForPrint(arg as NumberVal));
            break;
          case "string":
            console.log(processStringForPrint(arg as StringVal));
            break;
          case "null":
            console.log(processNullForPrint(arg as NullVal));
            break;
          case "boolean":
            console.log(processBooleanForPrint(arg as BoolVal));
            break;
          case "object":
            const obj = processObjectForPrint(arg as ObjectVal);
            console.log(obj);
            break;
          default:
            console.log(arg);
            break;
        }
      });
      return MK_NULL();
    }),
    true
  );

  env.declareVar(
    "parseCode",
    MK_NATIVE_FN((args, scope) => {
      if (!args[0]) return MK_NULL();
      if (args[0].type !== "string")
        throw `Expected string to be inputed into parseCode(), got: ${args[0].type}`;
      run((args[0] as StringVal).value);
      return MK_NULL();
    }),
    true
  );

  function concatFunction(_args: RuntimeVal[], _env: Environment) {
    if(_args[0].type !== "string" || _args[1].type !== "string") throw "Must concat 2 strings"
    return MK_STRING((_args[0] as StringVal).value + (_args[1] as StringVal).value);
  }

  env.declareVar("concat", MK_NATIVE_FN(concatFunction), true);

  function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
  }

  env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

  function inputFunction(_args: RuntimeVal[], _env: Environment) {
    const promptVal = _args[0] || MK_STRING("")
    if(promptVal.type != "string") throw "Input function must take in a string prompt"
    const input = prompt((promptVal as StringVal).value);
    if(!input) return MK_STRING("")
    return MK_STRING(input);
  }

  env.declareVar("input", MK_NATIVE_FN(inputFunction), true);
  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    isConstant: boolean
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname} twice`;
    }

    if (isConstant) this.constants.add(varname);
    this.variables.set(varname, value);

    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (varname == "true" || varname == "false" || varname == "null")
      throw `Cannot re-assign values to ${varname}.`;
    if (env.constants.has(varname))
      throw `Cannot re-assign to variable ${varname} as it was declared constant.`;
    env.variables.set(varname, value);
    return value;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) return this;
    if (this.parent == undefined)
      throw `Cannot resolve ${varname} as it does not exist`;

    return this.parent.resolve(varname);
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);

    return env.variables.get(varname) as RuntimeVal;
  }
}
