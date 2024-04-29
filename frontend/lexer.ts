export enum TokenType {
  Number,
  Identifier,

  Var,
  Const,

  BinaryOperator,
  Equals,
  Semicolon,
  OpenParen,
  ClosedParen,

  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  var: TokenType.Var,
  const: TokenType.Const,
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

  //future ref: deep copy sourceCode before using
  const src = sourceCode.split("");

  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.ClosedParen));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
      
    } else if (src[0] == ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon))
    } else {
      if (isint(src[0])) {
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }

        tokens.push(token(num, TokenType.Number));
      } else if (isalpha(src[0])) {
        let ident = "";
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }

        const reserverd = KEYWORDS[ident];
        if (typeof reserverd == "number") {
          tokens.push(token(ident, reserverd));
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
