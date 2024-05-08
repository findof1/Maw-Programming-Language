import Environment from "./runtime/environment.ts";
import { MK_STRING, RuntimeVal, StringVal } from "./runtime/values.ts";

export function readFileFunct(args: RuntimeVal[], _scope: Environment) {
  if (args[0].type !== "string") throw "Expected string parsed into readFile()";
    let text;
  try {
    text = Deno.readTextFileSync(`./${(args[0] as StringVal).value}`);
    return MK_STRING(text);
  } catch (err) {
    return MK_STRING(err);
  }


}

export function writeFileFunct(args: RuntimeVal[], _scope: Environment) {
  if (args[0].type !== "string" || args[1].type !== "string")
    throw "Expected strings parsed into writeFile()";

  try {
    Deno.writeTextFileSync(`./${(args[0] as StringVal).value}`, (args[1] as StringVal).value);
    return MK_STRING("");
  } catch (err) {
    return MK_STRING(err);
  }

  
}

export function appendFileFunct(args: RuntimeVal[], _scope: Environment) {
  if (args[0].type !== "string" || args[1].type !== "string")
    throw "Expected strings parsed into writeFile()";

  try {
    Deno.writeTextFileSync(`./${(args[0] as StringVal).value}`, (args[1] as StringVal).value, {
      append: true,
    });
    return MK_STRING("");
  } catch (err) {
    return MK_STRING(err);
  }

  
}
