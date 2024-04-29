import {
  Stat,
  Program,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  Expr,
  VarDeclaration,
  AssignmentExpr,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): Boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error(
        "Parser Error:\n",
        err,
        prev,
        " - Exprecting: ",
        type,
        "- Got: ",
        prev.type
      );
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.not_eof()) {
      program.body.push(this.parse_stat());
    }

    return program;
  }

  private parse_stat(): Stat {
    switch (this.at().type) {
      case TokenType.Var:
        return this.parse_var_declaration();
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }

  parse_var_declaration(): Stat {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name folowing var or const keyword."
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat();
      if (isConstant)
        throw "Must assign value to constant expression. No value provided.";

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Exprected equals sign when declaring variable."
    );

    const declaration = {
      kind: "VarDeclaration",
      constant: isConstant,
      value: this.parse_expr(),
      identifier
    } as VarDeclaration;

    if(this.at().type == TokenType.Semicolon) this.eat()

    return declaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignmnet_expr()
  }

  private parse_assignmnet_expr(): Expr {
    const left = this.parse_additive_expr() //Note to self: switch out w/ objectExpr later

    if(this.at().type == TokenType.Equals){

      this.eat();

      const value = this.parse_assignmnet_expr()

      if(this.at().type == TokenType.Semicolon) this.eat()

      return {value, assigne:left, kind:"AssignmentExpr"} as AssignmentExpr
    }



    return left;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_primary_expr(): Expr {
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen:
        this.eat();
        const value = this.parse_expr();
        this.expect(TokenType.ClosedParen, "Use closed parenthasis");
        return value;
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
