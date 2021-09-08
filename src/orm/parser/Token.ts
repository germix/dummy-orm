export const TOK_EOF = 0;
export const TOK_LEXEME = 1;
export const TOK_SELECT = 2;
export const TOK_DELETE = 3;
export const TOK_FROM = 4;
export const TOK_WHERE = 5;
export const TOK_NUMERIC = 6;
export const TOK_STRING = 7;
export const TOK_LIKE = 8;
export const TOK_BETWEEN = 9;
export const TOK_NOT = 10;
export const TOK_SHL = "<<";
export const TOK_SHR = ">>";
export const TOK_LE = '<=';
export const TOK_GE = '>=';
export const TOK_EQ = '==';
export const TOK_NE = '!=';
export const TOK_AND = "&";
export const TOK_OR = "|";
export const TOK_L_AND = '&&';
export const TOK_L_OR = '||';

export class Token
{
    public id;
    public line;
    public lexeme;

    constructor(id, line, lexeme)
    {
        this.id = id;
        this.line = line;
        this.lexeme = lexeme;
        if(lexeme == null)
        {
            this.lexeme = id;
        }
    }
};
