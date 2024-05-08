import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  RuntimeVal,
  StringVal,
} from "./values.ts";
import {
abs,
ceil,
  concatFunction,
  cos,
  deleteVariable,
  e,
  exit,
  factorial,
  floor,
  inputFunction,
  joinFunct,
  keyboardPress,
  leftClick,
  length,
  lowercase,
  middleClick,
  moveMouse,
  parseCode,
  parseScopedCode,
  pi,
  popFrom,
  popFromFront,
  pow,
  printFunct,
  pushTo,
  pushToFront,
  randomFunct,
  reverse,
  rightClick,
  round,
  scrollMouse,
  sin,
  sleepFunct,
  sqrt,
  tan,
  timeFunction,
  toArray,
  toNumber,
  toStringFunct,
  trim,
  uppercase,
  windowFunct,
} from "./nativeFunctions.ts";
import { appendFileFunct, readFileFunct, writeFileFunct } from "../fileFunctions.ts";

export function createGlobalEnv() {
  const env = new Environment();

  //native variables
  env.declareVar("true", MK_BOOL(true), true);

  env.declareVar("false", MK_BOOL(false), true);

  env.declareVar("null", MK_NULL(), true);

  ////NATIVE FUNCTIONS
  //proccess functions
  env.declareVar("print", MK_NATIVE_FN(printFunct), true);

  env.declareVar("parseScopedCode", MK_NATIVE_FN(parseScopedCode), true);

  env.declareVar("parseCode", MK_NATIVE_FN(parseCode), true);

  env.declareVar("exit", MK_NATIVE_FN(exit), true);

  env.declareVar("input", MK_NATIVE_FN(inputFunction), true);

  env.declareVar("sleep", MK_NATIVE_FN(sleepFunct), true);

  env.declareVar("delete", MK_NATIVE_FN(deleteVariable), true);

  env.declareVar("readFile", MK_NATIVE_FN(readFileFunct), true);

  env.declareVar("writeFile", MK_NATIVE_FN(writeFileFunct), true);

  env.declareVar("appendFile", MK_NATIVE_FN(appendFileFunct), true);

  env.declareVar("window", MK_NATIVE_FN(windowFunct), true);

  env.declareVar("keyboardPress", MK_NATIVE_FN(keyboardPress), true);

  env.declareVar("leftClick", MK_NATIVE_FN(leftClick), true);

  env.declareVar("rightClick", MK_NATIVE_FN(rightClick), true);

  env.declareVar("middleClick", MK_NATIVE_FN(middleClick), true);

  env.declareVar("moveMouse", MK_NATIVE_FN(moveMouse), true);

  env.declareVar("scrollMouse", MK_NATIVE_FN(scrollMouse), true);

  env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

  //string functions
  env.declareVar("concat", MK_NATIVE_FN(concatFunction), true);

  env.declareVar("length", MK_NATIVE_FN(length), true);

  env.declareVar("toNumber", MK_NATIVE_FN(toNumber), true);

  env.declareVar("uppercase", MK_NATIVE_FN(uppercase), true);

  env.declareVar("lowercase", MK_NATIVE_FN(lowercase), true);

  env.declareVar("trim", MK_NATIVE_FN(trim), true);

  env.declareVar("reverse", MK_NATIVE_FN(reverse), true);

  env.declareVar("toArray", MK_NATIVE_FN(toArray), true);

  //number functions
  env.declareVar("toString", MK_NATIVE_FN(toStringFunct), true);

  env.declareVar("random", MK_NATIVE_FN(randomFunct), true);

  env.declareVar("pi", MK_NATIVE_FN(pi), true);

  env.declareVar("e", MK_NATIVE_FN(e), true);

  env.declareVar("pow", MK_NATIVE_FN(pow), true);

  env.declareVar("round", MK_NATIVE_FN(round), true);

  env.declareVar("ceil", MK_NATIVE_FN(ceil), true);

  env.declareVar("floor", MK_NATIVE_FN(floor), true);

  env.declareVar("abs", MK_NATIVE_FN(abs), true);

  env.declareVar("sqrt", MK_NATIVE_FN(sqrt), true);

  env.declareVar("factorial", MK_NATIVE_FN(factorial), true);

  env.declareVar("sin", MK_NATIVE_FN(sin), true);

  env.declareVar("cos", MK_NATIVE_FN(cos), true);

  env.declareVar("tan", MK_NATIVE_FN(tan), true);

  //env.declareVar("length", MK_NATIVE_FN(length), true);

  //env.declareVar("toArray", MK_NATIVE_FN(toArray), true);

  //env.declareVar("reverse", MK_NATIVE_FN(reverse), true);
  
  //array functions
  env.declareVar("pushTo", MK_NATIVE_FN(pushTo), true);
  
  env.declareVar("join", MK_NATIVE_FN(joinFunct), true);

  env.declareVar("pushToFront", MK_NATIVE_FN(pushToFront), true);

  env.declareVar("popFrom", MK_NATIVE_FN(popFrom), true);

  env.declareVar("popFromFront", MK_NATIVE_FN(popFromFront), true);

  //env.declareVar("length", MK_NATIVE_FN(length), true);

  //env.declareVar("reverse", MK_NATIVE_FN(reverse), true);

  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const _global = parentENV ? true : false;
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

  public deleteVar(varname: RuntimeVal): RuntimeVal {
    try {
      if (varname.type !== "string")
        throw "Must parse a string into delete var function";
      const name = (varname as StringVal).value;
      const env = this.resolve(name);
      if (env.constants.has(name))
        throw `Cannot delete variable ${name} as it was declared constant.`;
      if (name == "true" || name == "false" || name == "null")
        throw `Cannot re-assign values to ${name}.`;

      env.variables.delete(name);

      return MK_NULL();
    } catch (err) {
      console.log("Warning: " + err);
      return MK_NULL();
    }
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
