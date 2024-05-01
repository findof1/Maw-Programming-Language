export enum TokenType {
  Number,
  Identifier,

  Var,
  Print,
  Const,
  Comma,
  Colon,
  Dot,
  SQuote,
  DQutoe,
  Funct,
  Return,
  If,
  Else,
  While,
  BinaryOperator,
  Equals,
  DEquals,
  GrEq,
  LsEq,
  Gr,
  Ls,
  NotEqual,
  Semicolon,
  OpenParen,
  ClosedParen,
  OpenBrace,
  ClosedBrace,
  OpenBracket,
  ClosedBracket,
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  var: TokenType.Var,
  Var: TokenType.Var,
  const: TokenType.Const,
  Const: TokenType.Const,
  return: TokenType.Return,
  Return: TokenType.Return,
  funct: TokenType.Funct,
  Funct: TokenType.Funct,
  if: TokenType.If,
  If: TokenType.If,
  else: TokenType.Else,
  Else: TokenType.Else,
  while: TokenType.While,
  While: TokenType.While,
};

export interface Token {
  value: string;
  type: TokenType;
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

function isalpha(str: string) {
  return str.toUpperCase() != str.toLowerCase();
}

function isint(str: string) {
  const char = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return char >= bounds[0] && char <= bounds[1];
}

function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  let insideStr = { in: false, type: "" };

  const temp = JSON.parse(JSON.stringify(sourceCode));
  const src = temp.split("");

  while (src.length > 0) {
    if (src[0] == "(" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.ClosedParen));
    } else if (src[0] == "{" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (src[0] == "}" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.ClosedBrace));
    } else if (src[0] == "[" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.OpenBracket));
    } else if (src[0] == "]" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.ClosedBracket));
    } else if (src[0] == "/" && src[1] == "/" && !insideStr.in) {
      src.shift();
      src.shift();
      while (src.length > 0 && (src[0] !== '\n' && src[0] !== '\r')) {
        src.shift();
      }
    }else if (src[0] == "." && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Dot));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/" ||
      (src[0] == "%" && !insideStr.in)
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=" && src[1] == "=" && !insideStr.in) {
      src.shift();
      src.shift();
      tokens.push(token("==", TokenType.DEquals));
    } else if (src[0] == "!" && src[1] == "=" && !insideStr.in) {
      src.shift();
      src.shift();
      tokens.push(token("!=", TokenType.NotEqual));
    } else if (src[0] == ">" && src[1] == "=" && !insideStr.in) {
      src.shift();
      src.shift();
      tokens.push(token(">=", TokenType.GrEq));
    } else if (src[0] == "<" && src[1] == "=" && !insideStr.in) {
      src.shift();
      src.shift();
      tokens.push(token("<=", TokenType.LsEq));
    } else if (src[0] == "=" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ">" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Gr));
    } else if (src[0] == "<" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Ls));
    } else if (src[0] == ";" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Semicolon));
    } else if (src[0] == `"`) {
      tokens.push(token(src.shift(), TokenType.DQutoe));
      insideStr.type = `"`;
      insideStr.in = !insideStr.in;
    } else if (src[0] == `'`) {
      insideStr.in = !insideStr.in;
      insideStr.type = `'`;
      tokens.push(token(src.shift(), TokenType.SQuote));
    } else if (src[0] == ":" && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] == "," && !insideStr.in) {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else {
      if (isint(src[0]) && !insideStr.in) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }

        tokens.push(token(num, TokenType.Number));
      } else if (insideStr.in) {
        let ident = "";
        while (src.length > 0 && src[0] !== insideStr.type) {
          ident += src.shift();
        }
        tokens.push(token(ident, TokenType.Identifier));
      } else if (isalpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }

        const reserverd = KEYWORDS[ident];
        if (typeof reserverd == "number") {
          tokens.push(token(ident, reserverd));
        } else if (ident == "elseif") {
          tokens.push(token("else", TokenType.Else));
          tokens.push(token("if", TokenType.If));
        } else {
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isskippable(src[0])) {
        src.shift();
      } else {
        console.log(`Unrecognised character in src: ${src[0]}`);
        console.log(`(code: ${src[0].charCodeAt(0)})`);
        Deno.exit(1);
      }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });

  return tokens;
}
