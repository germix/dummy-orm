import { ParserException } from "./ParserException";
import { Token, TOK_BETWEEN, TOK_DELETE, TOK_EOF, TOK_EQ, TOK_FROM, TOK_GE, TOK_LE, TOK_LEXEME, TOK_LIKE, TOK_L_AND, TOK_L_OR, TOK_NE, TOK_NOT, TOK_NUMERIC, TOK_SELECT, TOK_SHL, TOK_SHR, TOK_STRING, TOK_WHERE, TOK_ASSIGN } from "./Token";

function isSpace(c: string): boolean
{
    return (/^\s$/).test(c);
}

function isAlnum(c: string): boolean
{
    return /^[a-zA-Z0-9]+$/i.test(c);
}

function isAlpha(c: string): boolean
{
    return /^[a-zA-Z]+$/i.test(c);
}

function isDigit(c: string): boolean
{
    return /^[0-9]+$/i.test(c);
}

export class Lexer
{
    private in: string;
    private line: number;
    private cache: string;
    private eof: boolean;

    /**
     * Constructor
     * Iniciar el análisis léxico
     *
     * @param string string Cadena
     */
    constructor(string: string)
    {
        this.in = string;           // String de análisis
        this.line = 0;              // Línea actual durante el análisis
        this.cache = null;          // Caracter de caché
        this.eof = false;
    }

    /**
     * Obtener el siguiente token
     *
     * @return Token Token
     */
    public getToken(): Token
    {
        let c;
        let s;

        while(!this.eof)
        {
            c = this.read();
            if(c == null)
            {
                return new Token(TOK_EOF, this.line, null);
            }
            if(c == "\n")
            {
                this.line++;
            }
            else if(c == "\r")
            {
                // NADA
            }
            else if(isSpace(c))
            {
                // NADA
            }
            else if(isDigit(c))
            {
                s = c;

                while(true)
                {
                    c = this.read();
                    if(!(!this.feof() && (isAlpha(c) || c == '.')))
                    {
                        break;
                    }
                    s += c;
                }
                // Si no se ha llegado al final, poner en cache el último caracter
                if(!this.feof())
                {
                    this.save(c);
                }
                return new Token(TOK_NUMERIC, this.line, s);
            }
            else if(isAlpha(c) || c == '_')
            {
                // Guardar el primer caracter
                s = c;

                // Leer todos los caracteres válidos de un lexema de identificador (alfanumérico y '_')
                while(true)
                {
                    c = this.read();
                    if(!(!this.feof() && (isAlnum(c) || c == '_')))
                    {
                        break;
                    }
                    s += c;
                }
                // Si no se ha llegado al final, poner en cache el último caracter
                if(!this.feof())
                {
                    this.save(c);
                }
                return new Token(this.tokenFromLexeme(s), this.line, s);
            }
            else if(c == "'" || c == '"')
            {
                let sep = c;
                let lexeme = '';

                while(1)
                {
                    c = this.read();
                    if(c === sep || c === null)
                    {
                        break;
                    }
                    else
                    {
                        lexeme += c;
                    }
                }
                if(c === null)
                {
                    throw new ParserException("Unterminated literal string");
                }

                return new Token(TOK_STRING, this.line, lexeme);
            }
            else if(c == '<')
            {
                let x = this.read();
                if(x == '=')
                {
                    return new Token(TOK_LE, this.line, "<=");
                }
                else if(x == '<')
                {
                    return new Token(TOK_SHL, this.line, "<<");
                }
                this.save(x);
                return new Token(c, this.line, c);
            }
            else if(c == '>')
            {
                let x = this.read();
                if(x == '=')
                {
                    return new Token(TOK_GE, this.line, ">=");
                }
                else if(x == '>')
                {
                    return new Token(TOK_SHR, this.line, ">>");
                }
                this.save(x);
                return new Token(c, this.line, c);
            }
            else if(c == '!')
            {
                let x = this.read();
                if(x == '=')
                {
                    return new Token(TOK_NE, this.line, "!=");
                }
                this.save(x);
                return new Token(c, this.line, c);
            }
            else if(c == '=')
            {
                let x = this.read();
                if(x == '=')
                {
                    return new Token(TOK_EQ, this.line, "==");
                }
                this.save(x);
                return new Token(TOK_ASSIGN, this.line, c);
            }
            else if(c == '&')
            {
                let x = this.read();
                if(x == '&')
                {
                    return new Token(TOK_L_AND, this.line, "&&");
                }
                this.save(x);
                return new Token(c, this.line, c);
            }
            else if(c == '|')
            {
                let x = this.read();
                if(x == '|')
                {
                    return new Token(TOK_L_OR, this.line, "||");
                }
                this.save(x);
                return new Token(c, this.line, c);
            }
            else
            {
                return new Token(c, this.line, c);
            }
        }
        return new Token(TOK_EOF, this.line, null);
    }

    /**
     * Comprobar que se ha llegado al fin de la cadena
     *
     * @return boolean true|false
     */
    public feof(): boolean
    {
        return this.eof == true;
    }

    /**
     * Leer el siguiente caracter en la cadena
     *
     * @return string Caracter
     */
    private read(): string
    {
        let c;
        if(this.cache == null)
        {
            if(this.in.length == 0)
            {
                c = null;
                this.in = null;
                this.eof = true;
            }
            else
            {
                c = this.in[0];
                this.in = this.in.substr(1);
            }
            return c;
        }
        c = this.cache;
        this.cache = null;
        return c;
    }

    /**
     * Guardar un caracter en la caché
     *
     * @param string c Caracter
     */
    private save(c): void
    {
        this.cache = c;
    }

    private tokenFromLexeme(lexeme: string): string|number
    {
        const ucLexeme = lexeme.toUpperCase();

        if(ucLexeme == "SELECT")    return TOK_SELECT;
        if(ucLexeme == "DELETE")    return TOK_DELETE;
        if(ucLexeme == "FROM")      return TOK_FROM;
        if(ucLexeme == "WHERE")     return TOK_WHERE;
        if(ucLexeme == "LIKE")      return TOK_LIKE;
        if(ucLexeme == "BETWEEN")   return TOK_BETWEEN;
        if(ucLexeme == "AND")       return TOK_L_AND;
        if(ucLexeme == "OR")        return TOK_L_OR;
        if(ucLexeme == "NOT")       return TOK_NOT;

        return TOK_LEXEME;
    }
};
