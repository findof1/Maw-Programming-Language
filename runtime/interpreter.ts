import { RuntimeVal, NumberVal, MK_NULL, StringVal } from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  FunctionDeclaration,
  Identifier,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stat,
  StringLiteral,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_function_declaration, eval_program, eval_var_declaration } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_exrp,
  eval_call_expr,
  eval_identifier,
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
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation. ",
        astNode
      );
      Deno.exit(1);
  }
}
