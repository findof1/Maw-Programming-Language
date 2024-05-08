import {
  Stat,
  Program,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  Expr,
  VarDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
  FunctionDeclaration,
  ReturnStat,
  StringLiteral,
  IfStatement,
  WhileStatement,
  ForStatement,
  ArrLiteral,
  ArrProperty,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: string) {
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
      case TokenType.If:
        return this.parse_if_stat();
      case TokenType.While:
        return this.parse_while_stat();
      case TokenType.Return:
        return this.parse_return_stat();
      case TokenType.For:
        return this.parse_for_stat();
      default:
        return this.parse_expr();
    }
  }

  private parse_return_stat(): Stat {
    this.eat();
    const right = this.parse_stat();

    const ret = {
      kind: "ReturnStat",
      right,
    } as ReturnStat;

    return ret;
  }

  private parse_if_stat(): Stat {
    this.eat();
    this.expect(
      TokenType.OpenParen,
      "Expected open parenthesis during if statement."
    );
    const comparison = this.parse_expr();
    this.expect(
      TokenType.ClosedParen,
      "Expected closing parenthesis during if statment."
    );

    const body: Stat[] = [];

    this.expect(TokenType.OpenBrace, "Expected open brace in if statement");

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.ClosedBrace
    ) {
      body.push(this.parse_stat());
    }

    this.expect(
      TokenType.ClosedBrace,
      "Closing brace expected after if statement"
    );

    if (this.at().type == TokenType.Else) {
      this.eat();

      const elseBody: Stat[] = [];

      if (this.at().type == TokenType.If) {
        elseBody.push(this.parse_stat());
      } else {
        this.expect(TokenType.OpenBrace, "Expected open brace in if statement");

        while (
          this.at().type !== TokenType.EOF &&
          this.at().type !== TokenType.ClosedBrace
        ) {
          elseBody.push(this.parse_stat());
        }

        this.expect(
          TokenType.ClosedBrace,
          "Closing brace expected after if statement"
        );
      }

      const ifStat = {
        kind: "IfStatement",
        comparison,
        body,
        elseBody,
      } as IfStatement;

      return ifStat;
    } else {
      const ifStat = {
        kind: "IfStatement",
        comparison,
        body,
      } as IfStatement;

      return ifStat;
    }
  }

  private parse_while_stat(): Stat {
    this.eat();
    this.expect(
      TokenType.OpenParen,
      "Expected open parenthesis during while statement."
    );
    const comparison = this.parse_expr();
    this.expect(
      TokenType.ClosedParen,
      "Expected closing parenthesis during while statment."
    );

    const body: Stat[] = [];

    this.expect(TokenType.OpenBrace, "Expected open brace in while statement");

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.ClosedBrace
    ) {
      body.push(this.parse_stat());
    }

    this.expect(
      TokenType.ClosedBrace,
      "Closing brace expected after if statement"
    );

    const whileStat = {
      kind: "WhileStatement",
      comparison,
      body,
    } as WhileStatement;

    return whileStat;
  }

  private parse_for_stat(): Stat {
    this.eat();
    this.expect(
      TokenType.OpenParen,
      "Expected open parenthesis during while statement."
    );
    const varDec = this.parse_var_declaration();
    const comparison = this.parse_expr();
    if (this.at().type == TokenType.Semicolon) this.eat();
    const assignment = this.parse_assignmnet_expr();
    this.expect(
      TokenType.ClosedParen,
      "Expected closing parenthesis during while statment."
    );

    const body: Stat[] = [];

    this.expect(TokenType.OpenBrace, "Expected open brace in while statement");

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.ClosedBrace
    ) {
      body.push(this.parse_stat());
    }

    this.expect(
      TokenType.ClosedBrace,
      "Closing brace expected after if statement"
    );

    const forStat = {
      kind: "ForStatement",
      variable: varDec,
      increment: assignment,
      comparison,
      body,
    } as ForStatement;

    return forStat;
  }

  private parse_funct_declaration(): Stat {
    this.eat();

    const name = this.expect(
      TokenType.Identifier,
      "Expected function name following funct keyword."
    ).value;

    const args = this.parse_args();
    const parameters: string[] = [];

    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        throw "Inside function declaration expected parameters to be of type string";
      }

      parameters.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration."
    );

    const body: Stat[] = [];
    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.ClosedBrace
    ) {
      body.push(this.parse_stat());
    }

    this.expect(
      TokenType.ClosedBrace,
      "Closing brace expected inside function declaration."
    );
    const funct = {
      body,
      name,
      parameters,
      kind: "FunctionDeclaration",
    } as FunctionDeclaration;

    return funct;
  }

  private parse_var_declaration(): Stat {
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
      identifier,
    } as VarDeclaration;

    if (this.at().type == TokenType.Semicolon) this.eat();

    return declaration;
  }

  private parse_expr(): Expr {
    switch (this.at().type) {
      case TokenType.DQutoe:
      case TokenType.SQuote:
        return this.parse_string();
      case TokenType.Funct:
        return this.parse_funct_declaration();
      default:
        return this.parse_assignmnet_expr();
    }
  }

  private parse_assignmnet_expr(): Expr {
    const left = this.parse_object_arr_expr();

    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_expr();
      if (this.at().type == TokenType.Semicolon) this.eat();

      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    } else if (this.at().type == TokenType.Inc) {
      this.eat();
      const value = {
        kind: "BinaryExpr",
        left: { kind: "Identifier", symbol: (left as Identifier).symbol },
        right: { kind: "NumericLiteral", value: 1 },
        operator: "+",
      };
      if (this.at().type == TokenType.Semicolon) this.eat();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    } else if (this.at().type == TokenType.Dec) {
      this.eat();
      const value = {
        kind: "BinaryExpr",
        left: { kind: "Identifier", symbol: (left as Identifier).symbol },
        right: { kind: "NumericLiteral", value: 1 },
        operator: "-",
      };
      if (this.at().type == TokenType.Semicolon) this.eat();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_arr_expr(): Expr {
    switch (this.at().type) {
      case TokenType.OpenBracket:
        return this.parse_arr_expr();
      case TokenType.OpenBrace:
        return this.parse_object_expr();
      default:
        return this.parse_and_or_expr();
    }
  }

  private parse_arr_expr(): Expr {
    if (this.at().type !== TokenType.OpenBracket)
      return this.parse_and_or_expr();

    this.eat();

    const properties = new Array<ArrProperty>();
    let iter = 0;
    while (this.not_eof() && this.at().type !== TokenType.ClosedBracket) {
      const value = this.parse_expr();

      properties.push({ key: iter, kind: "ArrProperty", value });

      if (this.at().type !== TokenType.ClosedBracket)
        this.expect(
          TokenType.Comma,
          "Expected Closing Bracket following arr value."
        );
      iter++;
    }

    this.expect(
      TokenType.ClosedBracket,
      "Expected Closing Brace at the end of your object."
    );
    return { kind: "ArrLiteral", properties } as ArrLiteral;
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) return this.parse_and_or_expr();

    this.eat();

    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type !== TokenType.ClosedBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object Literal key expected."
      ).value;

      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } else if (this.at().type == TokenType.ClosedBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }

      this.expect(
        TokenType.Colon,
        "Missing Colon following an object expression."
      );

      const value = this.parse_expr();

      properties.push({ key, kind: "Property", value });

      if (this.at().type !== TokenType.ClosedBrace)
        this.expect(
          TokenType.Comma,
          "Expected Comma or Closing Brace following object property."
        );
    }

    this.expect(
      TokenType.ClosedBrace,
      "Expected Closing Brace at the end of your object."
    );
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_string(): Expr {
    let quoteType;
    if (this.at().type == TokenType.DQutoe) {
      quoteType = TokenType.DQutoe;
      this.eat();
    } else if (this.at().type == TokenType.SQuote) {
      quoteType = TokenType.SQuote;
      this.eat();
    } else {
      throw "Expected quote at start of string;";
    }

    if (this.at().type == quoteType) {
      this.eat();
      return {
        kind: "StringLiteral",
        value: "",
      } as StringLiteral;
    }

    const string = {
      kind: "StringLiteral",
      value: this.expect(
        TokenType.Identifier,
        "Expected value inside of string."
      ).value,
    } as StringLiteral;

    if (this.at().type !== quoteType)
      throw "Expected corresponding end quote at the end of a string.";
    this.eat();
    return string;
  }

  private parse_and_or_expr(): Expr {
    let left = this.parse_additive_expr();

    while (
      this.at().value == "and" ||
      this.at().value == "And" ||
      this.at().value == "or" ||
      this.at().value == "Or"
    ) {
      const operator = this.eat().value;
      const right = this.parse_additive_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (
      this.at().value == "+" ||
      this.at().value == "-" ||
      this.at().value == "==" ||
      this.at().value == ">=" ||
      this.at().value == "<=" ||
      this.at().value == "!=" ||
      this.at().value == ">" ||
      this.at().value == "<"
    ) {
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
    let left = this.parse_call_member_expr();

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }
    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis.");
    const args =
      this.at().type == TokenType.ClosedParen
        ? []
        : this.parse_arguments_list();

    this.expect(TokenType.ClosedParen, "Expected closing parenthesis.");

    if (this.at().type == TokenType.Semicolon) this.eat();
    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args = [this.parse_expr()];

    while (this.not_eof() && this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_expr());
    }

    return args;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;

      if (operator.type == TokenType.Dot) {
        computed = false;
        property = this.parse_primary_expr();

        if (property.kind != "Identifier") {
          throw "Cannot use dot operator without right hand side being an identifier.";
        }
      } else {
        computed = true;
        property = this.parse_expr();

        this.expect(
          TokenType.ClosedBracket,
          "Expected Closing Bracket in computed value"
        );
      }
      object = { kind: "MemberExpr", object, property, computed } as MemberExpr;
    }

    return object;
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
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expr();
        this.expect(TokenType.ClosedParen, "Use closed parenthasis");
        return value;
      }
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
