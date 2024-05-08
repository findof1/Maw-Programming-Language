import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

const text = Deno.readTextFileSync("./main.maws")

export const lib = Deno.dlopen("test.dll", {
  simulateKeyPress:{
    parameters:["u32"],
    result:"void"
  },
  simulateLeftMouseClick:{
    parameters:[],
    result:"void"
  },
  simulateRightMouseClick:{
    parameters:[],
    result:"void"
  },
  moveMouseCursor:{
    parameters:["u32", "u32"],
    result:"void"
  },
  simulateMiddleMouseClick:{
    parameters:[],
    result:"void"
  },
  simulateMouseScroll:{
    parameters:["u32"],
    result:"void"
  },
})

run(text);

lib.close()

//compile cmd: deno compile --unstable-ffi --allow-read --allow-write --allow-net --allow-env --allow-run --allow-ffi --output Maw main.ts

//development run cmd: deno run -A main.ts

export function run(input:string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  const program = parser.produceAST(input);
  evaluate(program, env);
}

export function runCode(input:string, env: Environment) {
  const parser = new Parser();
  const program = parser.produceAST(input);
  evaluate(program, env);
}

function _repl() {
  const parser = new Parser();
  const env = createGlobalEnv();

  console.log("\nRepl v0.1");
  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input as string);
    evaluate(program, env);
  }
}
