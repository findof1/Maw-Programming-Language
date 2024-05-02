import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

const text = await Deno.readTextFile("./main.maws")
run(text);

//compile cmd: deno compile --unstable --allow-read --allow-write --allow-net --allow-env --allow-run --output Maw main.ts

//development run cmd: deno run -A main.ts

export async function run(input:string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  const program = parser.produceAST(input);
  const res = evaluate(program, env);
}

async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();

  console.log("\nRepl v0.1");
  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input as string);
    const res = evaluate(program, env);
  }
}
