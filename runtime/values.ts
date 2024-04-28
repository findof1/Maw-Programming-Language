export type ValueType = "null" | "number" | "boolean";

export interface RuntimeVal {
  type: ValueType;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL():NullVal{
  return {value:null, type:"null"} as NullVal

}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_NUMBER(n:number = 0):NumberVal{
  return {value:n, type:"number"} as NumberVal

}

export interface BoolVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b:boolean = true):BoolVal{
  return {value:b, type:"boolean"} as BoolVal

}