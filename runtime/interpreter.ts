import { RuntimeVal, NumberVal, MK_NULL } from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  Identifier,
  NodeType,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stat,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import {
  eval_assignment,
  eval_binary_exrp,
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
    case "BinaryExpr":
      return eval_binary_exrp(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
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
