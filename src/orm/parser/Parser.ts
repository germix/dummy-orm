import { OrmEntityDefinition } from "../entity/OrmEntityDefinition";
import { OrmConfig } from "../OrmConfig";
import { Lexer } from "./Lexer";
import { Token, TOK_EOF, TOK_EQ, TOK_FROM, TOK_GE, TOK_LE, TOK_LEXEME, TOK_LIKE, TOK_L_AND, TOK_L_OR, TOK_NE, TOK_NUMERIC, TOK_SELECT, TOK_SHL, TOK_SHR, TOK_STRING, TOK_WHERE, TOK_AND, TOK_OR, TOK_BETWEEN, TOK_NOT } from "./Token";

// https://dev.mysql.com/doc/refman/8.0/en/operator-precedence.html

class FieldInfo
{
    tableAlias;
    fieldName;

    constructor(tableAlias, fieldName)
    {
        this.tableAlias = tableAlias;
        this.fieldName = fieldName;
    }
}

class FromPart
{
    entityName;
    alias;
    
    constructor(entityName, alias)
    {
        this.entityName = entityName;
        this.alias = alias;
    }
}

abstract class Expr
{
}

abstract class TermExpr extends Expr
{
    constructor()
    {
        super();
    }
}

class FieldExpr extends TermExpr
{
    field: string;

    constructor(field: string)
    {
        super();
        this.field = field;
    }
}

class StringExpr extends TermExpr
{
    value: string;

    constructor(value: string)
    {
        super();
        this.value = value;
    }
}

class NumericExpr extends TermExpr
{
    value: string;

    constructor(value: string)
    {
        super();
        this.value = value;
    }
}

class InfixExpr extends Expr
{
    op;
    left: Expr;
    right: Expr;

    constructor(op, left, right)
    {
        super();
        this.op = op;
        this.left = left;
        this.right = right;
    }
}

class NotExpr extends Expr
{
    expr: Expr;

    constructor(expr: Expr)
    {
        super();
        this.expr = expr;
    }
}

class BetweenExpr extends Expr
{
    left: Expr;
    rightMin: Expr;
    rightMax: Expr;

    constructor(left, rightMin, rightMax)
    {
        super();
        this.left = left;
        this.rightMin = rightMin;
        this.rightMax = rightMax;
    }
}

function stringifyTokenId(t)
{
    switch(t)
    {
        case TOK_EOF:       return "<EOF>";
        case TOK_LEXEME:    return "<LEXEME>";
        case TOK_SELECT:    return "SELECT";
        case TOK_FROM:      return "FROM";
        case TOK_WHERE:     return "WHERE";
        case TOK_NUMERIC:   return "<NUMERIC>";
        case TOK_STRING:    return "<STRING>";
        case TOK_LIKE:      return "LIKE";
        case TOK_BETWEEN:   return "BETWEEN";
    }
    return t;
}

export class Parser
{
    private lex: Lexer;
    private tok: Token;
    private config: OrmConfig;

    /**
     * Constructor
     */
    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    /**
     * Parsear
     *
     * @param string sql
     *
     * @return array
     */
    public parse(sql)
    {
        this.lex = new Lexer(sql);

        this.next();
        if(this.tok.id == TOK_SELECT)
            return this.parseSelect();

        // TODO
    }

    /**
     * Obtener el siguiente token
     *
     * @return Token
     */
    private next() : Token
    {
        this.tok = this.lex.getToken();

        console.log('NEXT: ')
        console.log(this.tok);
        
        return this.tok;
    }

    private match(t) : Token
    {
        let x = this.tok;
        if(this.tok.id != t)
        {
            throw "Expected \'" + stringifyTokenId(t) + "\', but found \'" + this.tok.lexeme + "\'";
        }
        this.next();
        return x;
    }

    private parseSelect()
    {
        let fields: FieldInfo[] = [];
        let fromParts: FromPart[] = [];
        let whereExpr: Expr = null;

        // Skip 'SELECT'
        this.next();

        //
        // Select fields
        //
        while(this.tok.id != TOK_EOF)
        {
            let tableAlias = this.nextIdentifier();

            if(this.tok.id == '.')
            {
                this.next();
                let fieldName = this.nextIdentifier();

                fields.push(new FieldInfo(tableAlias, fieldName));
            }
            else if(this.tok.id == '{')
            {
                this.next();
                while(this.tok.id != TOK_EOF && this.tok.id != '}')
                {
                    if(this.tok.id == ',')
                        this.next();

                    let fieldName = this.nextIdentifier();

                    fields.push(new FieldInfo(tableAlias, fieldName));
                }
                this.match('}');
            }
            else
            {
            }
            
            if(this.tok.id == ',')
                this.next();
            else
                break;
        }

        //
        // From clause
        //
        this.match(TOK_FROM);
        while(this.tok.id != TOK_EOF)
        {

            let entity = this.nextIdentifier();
            let alias = this.nextIdentifier();

            // TODO: check if entity exists

            fromParts.push(new FromPart(entity, alias));
            
            if(this.tok.id == ',')
                this.next();
            else
                break;
        }

        //
        // Where clause
        //
        if(this.tok.id == TOK_WHERE)
        {
            this.next();
            whereExpr = this.expr();
        }

        console.log(fields);
        console.log(fromParts);

        return this.generateSelectSQL(fields, fromParts, whereExpr);
    }

    private expr()
    {
        return this.expr_l_or();
    }

    private term() : Expr
    {
        let e = null;
        switch(this.tok.id)
        {
            case TOK_LEXEME:
                {
                    let s = '';
                    
                    s += this.nextIdentifier();
                    s += this.match('.').lexeme;
                    s += this.nextIdentifier();
                    e = new FieldExpr(s);
                }
                break;
            case TOK_STRING:
                {
                    e = new StringExpr(this.tok.lexeme);
                    this.next();
                }
                break;
            case TOK_NUMERIC:
                {
                    e = new NumericExpr(this.tok.lexeme);
                    this.next();
                }
                break;
        }

        return e;
    }

    //
    // '*' '/' '%'
    //
    private expr_prod() : Expr
    {
        let e = this.term();
        while(this.tok.id === '*' || this.tok.id === '/' || this.tok.id === '%')
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.term());
        }
        return e;
    }

    //
    // '-' '+'
    //
    private expr_sum() : Expr
    {
        let e = this.expr_prod();
        while(this.tok.id === '-' || this.tok.id === '+')
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_prod());
        }
        return e;
    }

    //
    // '<<' '>>'
    //
    private expr_shift() : Expr
    {
        let e = this.expr_sum();
        while(this.tok.id === TOK_SHL || this.tok.id === TOK_SHR)
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_sum());
        }
        return e;
    }

    //
    // '&'
    //
    private expr_and() : Expr
    {
        let e = this.expr_shift();
        while(this.tok.id === '&')
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_shift());
        }
        return e;
    }

    //
    // '|'
    //
    private expr_or() : Expr
    {
        let e = this.expr_and();
        while(this.tok.id === '|')
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_and());
        }
        return e;
    }

    //
    // '<' '<=' '>' '>=' '!=' '==' 'LIKE'
    //
    private expr_comparison() : Expr
    {
        let e = this.expr_or();
        while(this.tok.id === '<'
            || this.tok.id === TOK_LE
            || this.tok.id === '>'
            || this.tok.id === TOK_GE
            || this.tok.id === TOK_EQ
            || this.tok.id === TOK_NE
            || this.tok.id === TOK_LIKE)
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_or());
        }
        return e;
    }

    //
    // BETWEEN
    //
    private expr_between() : Expr
    {
        let e = this.expr_comparison();
        if(!(e instanceof TermExpr))
        {
            // TODO
        }
        while(this.tok.id === TOK_BETWEEN)
        {
            this.next();
            let min = this.term();
            this.match(TOK_AND);
            let max = this.term();
            e = new BetweenExpr(e, min, max);
        }
        return e;
    }

    //
    // NOT
    //
    private expr_not() : Expr
    {
        if(this.tok.id == TOK_NOT)
        {
            this.next();
            return new NotExpr(this.expr_between());
        }
        return this.expr_between();
    }

    //
    // '&&'
    //
    private expr_l_and() : Expr
    {
        let e = this.expr_not();
        while(this.tok.id === TOK_L_AND)
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_not());
        }
        return e;
    }

    //
    // '||'
    //
    private expr_l_or() : Expr
    {
        let e = this.expr_l_and();
        while(this.tok.id === TOK_L_OR)
        {
            let op = this.tok.id;
            this.next();
            e = new InfixExpr(op, e, this.expr_l_and());
        }
        return e;
    }

    private nextIdentifier()
    {
        if(this.tok.id != TOK_LEXEME)
        {
            this.match(TOK_LEXEME);
        }
        let ident = this.tok.lexeme;
        this.next();
        return ident;
    }

    private generateSelectSQL(fields: FieldInfo[], fromParts: FromPart[], whereExpr: Expr)
    {
        let sql = '';
        let dbName = this.config.dbname;

        let lastSubAliasId = 1;
        
        let aliasTablesToData = {};
        let aliasFieldsToData = {};

        let fieldsToSelect = [];
        let fromClauses = [];
        let whereClause = null;

        if(fromParts.length > 0)
        {
            fromParts.forEach((from) =>
            {
                let entityDefinition = this.config.getEntityDefinition(from.entityName);
                let tableName = entityDefinition.tableName;
                let mainSubAlias = 't' + lastSubAliasId++;
                let fromClause = `\`${dbName}\`.\`${tableName}\` ${mainSubAlias}`;
                
                aliasTablesToData[from.alias] = {};
                aliasTablesToData[from.alias][tableName] = mainSubAlias;

                {
                    let ed = entityDefinition;
                    if(ed.extends !== undefined)
                    {
                        //
                        // Get ids
                        //
                        let ids = this.config.getEntityIds(ed);
            
                        //
                        // ...
                        //
                        ed = ed.extends;
                        do
                        {
                            let first = true;
                            let joinSubAlias = 't' + lastSubAliasId++;
                            
                            fromClause += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ${joinSubAlias} ON `;
                            aliasTablesToData[from.alias][ed.tableName] = joinSubAlias;

                            for(const idName in ids)
                            {
                                if(!first)
                                    fromClause += " AND ";
                                first = false;
                                fromClause += `${mainSubAlias}.\`${idName}\` = ${joinSubAlias}.\`${idName}\``;
                            }
                            ed = ed.extends;
                        }
                        while(ed !== undefined);
                    }
                }
                
                fromClauses.push(fromClause);

            })
        }

        //
        // Fields to select
        //
        fields.forEach((fieldInfo) =>
        {
            const fromAlias = fieldInfo.tableAlias;
            const fieldName = fieldInfo.fieldName;
            const entityDefinition = this.findEntityDefinitionFromAlias(fromParts, fromAlias);

            const {
                subAlias,
                fieldNameAs,
                fieldNameOriginal,
            } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);

            fieldsToSelect.push(`${subAlias}.${fieldNameOriginal} as ${fieldNameAs}`);
        });

        //
        // Where clause
        //
        if(whereExpr != null)
        {
            whereClause = this.stringifyExpr(aliasTablesToData, fromParts, whereExpr);
        }

        // ...
        sql += 'SELECT ' + fieldsToSelect.join(', ');
        if(fromClauses.length > 0)
        {
            sql += " FROM " + fromClauses.join(', ');
        }
        if(whereClause != null)
        {
            sql += " WHERE " + whereClause;
        }
        // ...
        return sql;
    }

    private stringifyExpr(aliasTablesToData, fromParts: FromPart[], expr: Expr) : string
    {
        let s = '';

        if(expr instanceof FieldExpr)
        {

            let parts = expr.field.split('.');
            
            const fromAlias = parts[0];
            const fieldName = parts[1];
            const entityDefinition = this.findEntityDefinitionFromAlias(fromParts, fromAlias);

            const {
                subAlias,
                fieldNameAs,
                fieldNameOriginal,
            } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);

            s = `${subAlias}.${fieldNameOriginal}`;;
        }
        if(expr instanceof StringExpr)
        {
            s = `'${expr.value}'`;
        }
        if(expr instanceof NumericExpr)
        {
            s = expr.value;
        }
        if(expr instanceof InfixExpr)
        {
            s += this.stringifyExpr(aliasTablesToData, fromParts, expr.left);
            switch(expr.op)
            {
                case '*':           s += " * ";             break;
                case '/':           s += " / ";             break;
                case '%':           s += " % ";             break;
                case '-':           s += " - ";             break;
                case '+':           s += " + ";             break;
                case TOK_SHL:       s += " << ";            break;
                case TOK_SHR:       s += " >> ";            break;
                case '<':           s += " < ";             break;
                case '>':           s += " > ";             break;
                case TOK_LE:        s += " <= ";            break;
                case TOK_GE:        s += " >= ";            break;
                case TOK_NE:        s += " != ";            break;
                case TOK_EQ:        s += " = ";             break;
                case TOK_AND:       s += " & ";             break;
                case TOK_OR:        s += " | ";             break;
                case TOK_L_AND:     s += " && ";            break;
                case TOK_L_OR:      s += " || ";            break;
                case TOK_LIKE:      s += " LIKE ";          break;
                default:
                    // TODO
                    break;
            }
            s += this.stringifyExpr(aliasTablesToData, fromParts, expr.right);
        }
        if(expr instanceof NotExpr)
        {
            s += "NOT " + this.stringifyExpr(aliasTablesToData, fromParts, expr.expr);
        }
        if(expr instanceof BetweenExpr)
        {
            s += this.stringifyExpr(aliasTablesToData, fromParts, expr.left);
            s += " BETWEEN ";
            s += this.stringifyExpr(aliasTablesToData, fromParts, expr.rightMin);
            s += " AND ";
            s += this.stringifyExpr(aliasTablesToData, fromParts, expr.rightMax);
        }
        return s;
    }

    private getFieldData(aliasTablesToData, fromAlias, entityDefinition: OrmEntityDefinition, fieldName)
    {
        let fieldNameParts = fieldName.split(" as ");
        let fieldNameAs = (fieldNameParts.length == 2) ? fieldNameParts[1] : fieldName;
        let fieldNameOriginal = (fieldNameParts.length == 2) ? fieldNameParts[0] : fieldName;
        let entityDefinitionFromField = this.config.findDefinitionFromFieldOrId(entityDefinition, fieldNameOriginal);
        let subAlias = aliasTablesToData[fromAlias][entityDefinitionFromField.tableName];

        return {
            subAlias,
            fieldNameAs,
            fieldNameOriginal,
        }
    }

    private findEntityDefinitionFromAlias(fromParts: FromPart[], fromAlias)
    {
        let from = fromParts.find((from) =>
        {
            return from.alias == fromAlias;
        });
        if(!from)
        {
            // TODO
        }
        
        let entityDefinition = this.config.getEntityDefinition(from.entityName);

        return entityDefinition;
    }
}
