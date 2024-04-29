import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

run("./test.maws");

async function run(filename:string) {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = await Deno.readTextFile(filename)
  const program = parser.produceAST(input);
  const res = evaluate(program, env);
  console.log(res);
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
    console.log(res);
  }
}
