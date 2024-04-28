import { ValueType, RuntimeVal, NumberVal, NullVal } from "./values.ts";
import {
  BinaryExpr,
  NodeType,
  NumericLiteral,
  Program,
  Stat,
} from "../frontend/ast.ts";

function eval_program(program: Program): RuntimeVal {
  let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal;

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement);
  }

  return lastEvaluated;
}

function eval_numeric_binary_expr(
  left: NumberVal,
  right: NumberVal,
  operator: string
): NumberVal {
  switch (operator) {
    case "+":
      return { value: left.value + right.value, type: "number" };
    case "-":
      return { value: left.value - right.value, type: "number" };
    case "*":
      return { value: left.value * right.value, type: "number" };
    case "/":
      return { value: left.value / right.value, type: "number" };
    case "%":
      return { value: left.value % right.value, type: "number" };
  }
}

function eval_binary_exrp(binop: BinaryExpr): RuntimeVal {
  const leftHandSide = evaluate(binop.left);
  const rightHandSide = evaluate(binop.right);
  if (leftHandSide.type == "number" && rightHandSide.type == "number") {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator
    );
  }

  return { type: "null", value: "null" } as NullVal;
}

export function evaluate(astNode: Stat): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal;
    case "BinaryExpr":
      return eval_binary_exrp(astNode as BinaryExpr);
    case "Program":
      return eval_program(astNode as Program);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation. ",
        astNode
      );
      Deno.exit(1);
  }
}
