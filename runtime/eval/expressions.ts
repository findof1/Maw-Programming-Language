import {
  ArrLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  MemberExpr,
  ObjectLiteral,
  StringLiteral,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { ArrayVal, BoolVal, FunctionValue, MK_NULL, MK_STRING, NativeFnValue, NumberVal, ObjectVal, ReturnVal, RuntimeVal, StringVal } from "../values.ts";

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
    default:
      throw "Invalid operator in binary expr"
  }
}

function eval_bool_binary_expr(
  left: NumberVal,
  right: NumberVal,
  operator: string
): BoolVal {
  switch (operator) {
    case "==":
      return { value: left.value === right.value, type: "boolean" };
    case ">=":
      return { value: left.value >= right.value, type: "boolean" };
    case "<=":
      return { value: left.value <= right.value, type: "boolean" };
    case "!=":
      return { value: left.value !== right.value, type: "boolean" };
    case "<":
      return { value: left.value < right.value, type: "boolean" };
    case ">":
      return { value: left.value > right.value, type: "boolean" };
    default:
      throw "Invalid operator in binary expr"

  }
}

function eval_and_or_expr(
  left: BoolVal,
  right: BoolVal,
  operator: string
): BoolVal {
  switch (operator) {
    case "and":
      return { value: left.value && right.value, type: "boolean" };
    case "And":
      return { value: left.value && right.value, type: "boolean" };
    case "or":
      return { value: left.value || right.value, type: "boolean" };
    case "Or":
      return { value: left.value || right.value, type: "boolean" };
    default:
      throw "Invalid operator in binary expr"

  }
}

export function eval_binary_exrp(
  binop: BinaryExpr,
  env: Environment
): RuntimeVal {
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);
  if (leftHandSide.type == "number" && rightHandSide.type == "number" && binop.operator !== '==' && binop.operator !== '>=' && binop.operator !== '<=' && binop.operator !== '!=' && binop.operator !== '>' && binop.operator !== '<') {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator
    );
  }else if(leftHandSide.type == "number" && rightHandSide.type == "number"){
    return eval_bool_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator
    );
  }else if(leftHandSide.type == "boolean" && rightHandSide.type == "boolean"){
    return eval_and_or_expr(
      leftHandSide as BoolVal,
      rightHandSide as BoolVal,
      binop.operator
    );
  }

  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (node.assigne.kind !== "Identifier")
    throw `Invalid left hand side: ${JSON.stringify(node.assigne)}`;

  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {

  const object = { type: "object", properties: new Map()} as ObjectVal

  for (const {key, value} of obj.properties){
    
    const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env)
    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function eval_arr_expr(
  arr: ArrLiteral,
  env: Environment
): RuntimeVal {

  const array = { type: "array", properties:[]} as ArrayVal

  for (const {key, value} of arr.properties){
    
    const runtimeVal = evaluate(value, env)
    array.properties[key] = runtimeVal;
  }

  return array;
}

export function eval_member_expr(
  expr: MemberExpr,
  env: Environment
): RuntimeVal {

  let prop;
  if(expr.property.kind == "Identifier"){
    prop = expr.property
  }else{
    prop = evaluate(expr.property, env)
  }
  let member;
  if(expr.object.kind !== "MemberExpr"){
    
  if(expr.object.kind == "StringLiteral"){
  member = env.lookupVar((expr.object as StringLiteral).value)
  }else{
    
    member = env.lookupVar((expr.object as Identifier).symbol)
  }
  }else{
    
    const final = evaluate(expr.object, env)

    
    if(final.type == "string"){
      member = (final as StringVal)
      }else{
        member = final
      }
  }

  if(member && member.type == 'object'){

    return (member as ObjectVal).properties.get((prop as Identifier).symbol) || MK_NULL()
  }else if(member && member.type == 'array'){
    return (member as ArrayVal).properties[(prop as NumberVal).value];
  }else if(member && member.type == 'string'){
    return MK_STRING((member as StringVal).value[(prop as NumberVal).value]);
  }else{
    throw "Member expression invalid."
  }

}

export function eval_call_expr(
  expr: CallExpr,
  env: Environment
): RuntimeVal {

  const args = expr.args.map((arg)=> {

    return evaluate(arg, env)

  })
  
  const fn = evaluate(expr.caller, env);
  
  if(fn.type == "native-fn"){
    
    const res = (fn as NativeFnValue).call(args, env)
  return res;
  }
  
  if(fn.type == "function"){
    const funct = fn as FunctionValue;
    const scope = new Environment(funct.declarationEnv);

    if(args.length !== funct.parameters.length){
      throw "Too many or to little arguments passed into a function when calling."
    }

    for(let i = 0; i < funct.parameters.length; i++){
      
      scope.declareVar(funct.parameters[i], args[i], false);
    }

    let result: RuntimeVal = MK_NULL();

    for(const stat of funct.body){

      const temp = evaluate(stat, scope)

      if(temp.type == "return"){
        result = (temp as ReturnVal).right
        break;
      }
    }

    return result;
  }

  throw "Cannot call value that is not a function: " + JSON.stringify(fn);
  
}