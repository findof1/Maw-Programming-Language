export type NodeType =
  //statements
  | "Program"
  | "VarDeclaration"
  //expressions
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"
  //Literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "NullLiteral"
  | "Identifier"
  | "BinaryExpr";

export interface Stat {
  kind: NodeType;
}

export interface Program extends Stat {
  kind: "Program";
  body: Stat[];
}

export interface VarDeclaration extends Stat {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface Expr extends Stat {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}
