import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

const text = await Deno.readTextFile("./test.maws")
run(text);

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
