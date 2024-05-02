import { BinaryExpr, ForStatement, FunctionDeclaration, IfStatement, Program, ReturnStat, VarDeclaration, WhileStatement } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BoolVal, FunctionValue, MK_NULL, ReturnVal, RuntimeVal } from "../values.ts";

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
  let result: RuntimeVal = MK_NULL();
  if((bool as BoolVal).value){
  for(const stat of ifStat.body){
    const temp = evaluate(stat, env)
      if(temp.type == "return"){
        result = (temp as ReturnVal)
        break;
      }
  }
}else if(ifStat.elseBody){
  for(const stat of ifStat.elseBody){
    const temp = evaluate(stat, env)
      if(temp.type == "return"){
        result = (temp as ReturnVal)
        break;
      }
  }
}

return result
}

export function eval_while_statement(whileStat: WhileStatement, env: Environment): RuntimeVal{
  const bool = evaluate(whileStat.comparison, env)
  let result: RuntimeVal = MK_NULL();
  if((bool as BoolVal).value){
  for(const stat of whileStat.body){
    const temp = evaluate(stat, env)
      if(temp.type == "return"){
        result = (temp as ReturnVal)
        break;
      }
  }
  eval_while_statement(whileStat, env)
  }
return result
}

export function eval_for_statement(forStat: ForStatement, env: Environment): RuntimeVal{


  const scope = new Environment(env);
  evaluate(forStat.variable, scope)
  

  return run_for_statement(forStat, scope)

}

function run_for_statement(forStat: ForStatement, scope: Environment){
  let result: RuntimeVal = MK_NULL();
  const bool = evaluate(forStat.comparison, scope)
  if((bool as BoolVal).value){
    for(const stat of forStat.body){

      const temp = evaluate(stat, scope)
        if(temp.type == "return"){
          result = (temp as ReturnVal)
          break;
        }

        evaluate(forStat.increment, scope)

    }
    run_for_statement(forStat, scope, bool)
    }
    return result;
}

export function eval_return_statement(ret: ReturnStat, env: Environment): RuntimeVal{
  const right = evaluate(ret.right, env)
  return {type: "return", right} as ReturnVal
}
