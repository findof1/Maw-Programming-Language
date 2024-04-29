import { BinaryExpr, Identifier } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, NumberVal, RuntimeVal } from "../values.ts";

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




export function eval_binary_exrp(binop: BinaryExpr, env: Environment): RuntimeVal {
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);
  if (leftHandSide.type == "number" && rightHandSide.type == "number") {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator
    );
  }

  return MK_NULL()
}

export function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}