import { RuntimeVal, NumberVal, MK_NULL, StringVal } from "./values.ts";
import {
  ArrLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  MemberExpr,
  NumericLiteral,
  ObjectLiteral,
  Program,
  ReturnStat,
  Stat,
  StringLiteral,
  VarDeclaration,
  WhileStatement,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import {
  eval_for_statement,
  eval_function_declaration,
  eval_if_statement,
  eval_program,
  eval_return_statement,
  eval_var_declaration,
  eval_while_statement,
} from "./eval/statements.ts";
import {
  eval_arr_expr,
  eval_assignment,
  eval_binary_exrp,
  eval_call_expr,
  eval_identifier,
  eval_member_expr,
  eval_object_expr,
} from "./eval/expressions.ts";

export function evaluate(astNode: Stat, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "ArrLiteral":
      return eval_arr_expr(astNode as ArrLiteral, env);
    case "StringLiteral":
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringVal;
    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);
    case "BinaryExpr":
      return eval_binary_exrp(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    case "MemberExpr":
      return eval_member_expr(astNode as MemberExpr, env);
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    case "IfStatement":
      return eval_if_statement(astNode as IfStatement, env);
    case "WhileStatement":
      return eval_while_statement(astNode as WhileStatement, env);
    case "ForStatement":
      return eval_for_statement(astNode as ForStatement, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "ReturnStat":
      return eval_return_statement(astNode as ReturnStat, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation. ",
        astNode
      );
      Deno.exit(1);
      return MK_NULL();
  }
}
