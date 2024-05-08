import { lib, run, runCode } from "../main.ts";
import Environment from "./environment.ts";
import { Webview } from "jsr:@webview/webview";
import {
  ArrayVal,
  BoolVal,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  NullVal,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "./values.ts";

export function deleteVariable(_args: RuntimeVal[], env: Environment) {
  env.deleteVar(_args[0]);
  return MK_NULL();
}

export function sleepFunct(args: RuntimeVal[], _env: Environment) {
  if (args[0].type != "number")
    throw "Expected number parsed into sleep()";
  const date = Date.now();
  let curDate = Date.now();
  do {
    curDate = Date.now();
  } while (curDate - date < (args[0] as NumberVal).value);
  return MK_NULL();
}

export function toStringFunct(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into toString()";
  const num = (_args[0] as NumberVal).value;
  const str = num.toString();
  return MK_STRING(str);
}

export function round(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into round()";

  return MK_NUMBER(Math.round((_args[0] as NumberVal).value));
}

export function ceil(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into ceil()";

  return MK_NUMBER(Math.ceil((_args[0] as NumberVal).value));
}

export function abs(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into abs()";

  return MK_NUMBER(Math.abs((_args[0] as NumberVal).value));
}

export function sin(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into sin()";

  return MK_NUMBER(Math.sin((_args[0] as NumberVal).value));
}

export function cos(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into cos()";

  return MK_NUMBER(Math.cos((_args[0] as NumberVal).value));
}

export function tan(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into tan()";

  return MK_NUMBER(Math.tan((_args[0] as NumberVal).value));
}

export function factorial(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into factorial()";

  const num = (_args[0] as NumberVal).value;
  let result = 1;
 
  for (let i = 2; i <= num; i++) {
     result *= i;
  }
 
  return MK_NUMBER(result);
}

export function sqrt(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into sqrt()";

  return MK_NUMBER(Math.sqrt((_args[0] as NumberVal).value));
}

export function floor(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "number")
    throw "Expected number parsed into floor()";

  return MK_NUMBER(Math.floor((_args[0] as NumberVal).value));
}

export function pow(args: RuntimeVal[], _env: Environment) {
  if (args[0].type != "number" || args[1].type != "number")
    throw "Expected number parsed into pow()";

  return MK_NUMBER(Math.pow((args[0] as NumberVal).value, (args[1] as NumberVal).value));
}

export function pi(_args: RuntimeVal[], _env: Environment) {
  return MK_NUMBER(Math.PI);
}

export function e(_args: RuntimeVal[], _env: Environment) {
  return MK_NUMBER(Math.E);
}

export function joinFunct(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "array")
    throw "Expected array parsed into join function";
  let str = "";
  for (let i = 0; i < (_args[0] as ArrayVal).properties.length; i++) {
    str =
      str +
      ((_args[0] as ArrayVal).properties[i] as StringVal | NumberVal).value;
  }
  return MK_STRING(str);
}

export function randomFunct(_args: RuntimeVal[], _env: Environment) {
  const num = Math.random();
  if (_args.length == 0) return MK_NUMBER(num);
  if (_args.length != 2)
    throw "Must either pass in no args, or two args into random.";
  if (_args[0].type != "number" || _args[1].type != "number")
    throw "Expected number parsed random function.";
  let min = (_args[0] as NumberVal).value;
  let max = (_args[1] as NumberVal).value;
  min = Math.ceil(min);
  max = Math.floor(max);
  return MK_NUMBER(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function toNumber(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type != "string")
    throw "Expected string parsed into toNumber function";
  const str = (_args[0] as StringVal).value;
  const num = parseInt(str);
  return MK_NUMBER(num);
}

export function inputFunction(_args: RuntimeVal[], _env: Environment) {
  const promptVal = _args[0] || MK_STRING("");
  if (promptVal.type != "string")
    throw "Input function must take in a string prompt";
  const input = prompt((promptVal as StringVal).value);
  if (!input) return MK_STRING("");
  return MK_STRING(input);
}

export function timeFunction(_args: RuntimeVal[], _env: Environment) {
  return MK_NUMBER(Date.now());
}

export function concatFunction(_args: RuntimeVal[], _env: Environment) {
  if (_args[0].type !== "string" || _args[1].type !== "string")
    throw "Must concat 2 strings";
  return MK_STRING(
    (_args[0] as StringVal).value + (_args[1] as StringVal).value
  );
}

export function parseScopedCode(args: RuntimeVal[], _env: Environment) {
  if (!args[0]) return MK_NULL();
  if (args[0].type !== "string")
    throw `Expected string to be parsed into parseScopedCode(), got: ${args[0].type}`;
  run((args[0] as StringVal).value);
  return MK_NULL();
}

export function parseCode(args: RuntimeVal[], scope: Environment) {
  if (!args[0]) return MK_NULL();
  if (args[0].type !== "string")
    throw `Expected string to be parsed into parseCode(), got: ${args[0].type}`;
  runCode((args[0] as StringVal).value, scope);
  return MK_NULL();
}

export function uppercase(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string")
    throw `Expected string to be parsed into uppercase()`;
  return MK_STRING((args[0] as StringVal).value.toUpperCase());
}

export function length(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string" && args[0].type !== "number" && args[0].type !== "array")
    throw `Expected string, array, or number to be parsed into length()`;
  
  if(args[0].type == "string" ) return MK_NUMBER((args[0] as StringVal).value.length)

  if(args[0].type == "array" ) return MK_NUMBER((args[0] as ArrayVal).properties.length)

  return MK_NUMBER(`${(args[0] as NumberVal).value}`.length)
}

export function lowercase(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string")
    throw `Expected string to be parsed into lowercase()`;
  return MK_STRING((args[0] as StringVal).value.toLowerCase());
}

export function trim(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string")
    throw `Expected string to be parsed into trim()`;
  return MK_STRING((args[0] as StringVal).value.trim());
}

export function reverse(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string" && args[0].type !== "array" && args[0].type !== "number")
    throw `Expected string, array or number to be parsed into reverse()`;

  if(args[0].type == "string") return MK_STRING((args[0] as StringVal).value.split("").reverse().join(""));

  if(args[0].type == "number") return MK_NUMBER(parseInt(`${(args[0] as NumberVal).value}`.split("").reverse().join("")));

  return {type:"array", properties:(args[0] as ArrayVal).properties.reverse()} as ArrayVal;
  
}

export function pushTo(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "array") {
    throw "Expected array parsed into pushTo()";
  }
  (args[0] as ArrayVal).properties.push(args[1]);
  return MK_NULL();
}

export function popFrom(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "array") {
    throw "Expected array parsed into popFrom()";
  }
  (args[0] as ArrayVal).properties.pop();
  return MK_NULL();
}

export function pushToFront(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "array") {
    throw "Expected array parsed into pushToFront()";
  }
  (args[0] as ArrayVal).properties.unshift(args[1]);
  return MK_NULL();
}

export function popFromFront(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "array") {
    throw "Expected array parsed into popFromFront()";
  }
  (args[0] as ArrayVal).properties.shift();
  return MK_NULL();
}

export function windowFunct(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string") throw "Expected string parsed into window()";

  const webview = new Webview();

  webview.navigate(
    `data:text/html,${encodeURIComponent((args[0] as StringVal).value)}`
  );
  webview.run();
  return MK_NULL();
}

export function keyboardPress(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "string") throw "Expected string parsed into keyboardPress()";
  const num = (args[0] as StringVal).value.charCodeAt(0)
  lib.symbols.simulateKeyPress(num)
  return MK_NULL();
}

export function leftClick(_args: RuntimeVal[], _env: Environment) {
  lib.symbols.simulateLeftMouseClick()
  return MK_NULL();
}

export function rightClick(_args: RuntimeVal[], _env: Environment) {
  lib.symbols.simulateRightMouseClick()
  return MK_NULL();
}

export function middleClick(_args: RuntimeVal[], _env: Environment) {
  lib.symbols.simulateMiddleMouseClick()
  return MK_NULL();
}

export function moveMouse(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "number" || args[1].type !== "number") throw "Expected numbers parsed into moveMouse()";
  lib.symbols.moveMouseCursor((args[0] as NumberVal).value,(args[1] as NumberVal).value)
  return MK_NULL();
}

export function scrollMouse(args: RuntimeVal[], _env: Environment) {
  if (args[0].type !== "number") throw "Expected numbers parsed into scrollMouse()";
  lib.symbols.simulateMouseScroll((args[0] as NumberVal).value)
  return MK_NULL();
}

export function toArray(args: RuntimeVal[], _env: Environment): ArrayVal {
  if (args[0].type == "number") {
    (args[0] as StringVal).value = `${(args[0] as NumberVal).value}`;
    args[0].type = "string";
  }
  if (args[0].type !== "string")
    throw "Expected string or number parsed into toArray()";
  const arr = (args[0] as StringVal).value.split("");
  const prop: StringVal[] = [];
  for (let i = 0; i < arr.length; i++) {
    prop.push(MK_STRING(arr[i]));
  }
  return { type: "array", properties: prop };
}

export function printFunct(args: RuntimeVal[], _env: Environment) {
  args.forEach((arg) => {
    switch (arg.type) {
      case "number":
        console.log(processNumberForPrint(arg as NumberVal));
        break;
      case "array":
        console.log(processArrForPrint(arg as ArrayVal));
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
        console.log(processObjectForPrint(arg as ObjectVal));
        break;
      default:
        console.log(arg);
        break;
    }
  });
  return MK_NULL();
}

function processObjectForPrint(obj: ObjectVal) {
  const res = processMapForPrint(obj.properties);
  return res;
}

function processMapForPrint(obj: Map<string, RuntimeVal>): object {
  const result: { [key: string]: number | string | object | null | boolean } =
    {};
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

function processArrForPrint(
  arr: ArrayVal
): Array<number | string | object | null | boolean> {
  const result: Array<number | string | object | null | boolean> = [];
  for (let i = 0; i < arr.properties.length; i++) {
    const value = arr.properties[i];
    if (value instanceof Map) {
      result[i] = processMapForPrint(value);
    } else if (value.type == "object") {
      result[i] = processObjectForPrint(value as ObjectVal);
    } else if (value.type == "array") {
      result[i] = processArrForPrint(value as ArrayVal);
    } else if (value.type == "number") {
      result[i] = processNumberForPrint(value as NumberVal);
    } else if (value.type == "string") {
      result[i] = processStringForPrint(value as StringVal);
    } else if (value.type == "null") {
      result[i] = processNullForPrint(value as NullVal);
    } else if (value.type == "boolean") {
      result[i] = processBooleanForPrint(value as BoolVal);
    } else {
      result[i] = value;
    }
  }

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

export function exit(_args: RuntimeVal[], _env: Environment) {
  Deno.exit(1);
  return MK_NULL();
}
