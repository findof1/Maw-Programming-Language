import { BinaryExpr, FunctionDeclaration, IfStatement, Program, VarDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  
  const funct = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue

  return env.declareVar(declaration.name, funct, true);
}

export function eval_if_statement(ifStat: IfStatement, env: Environment): RuntimeVal{
  const bool = evaluate(ifStat.comparison, env)
  if((bool as BoolVal).value){
  for(const stat of ifStat.body){
    evaluate(stat, env)
  }
}else if(ifStat.elseBody){
  for(const stat of ifStat.elseBody){
    evaluate(stat, env)
  }
}
return MK_NULL()
}