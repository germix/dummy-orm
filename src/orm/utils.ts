const ORM_GET_METHOD_PREFIX = 'get';

export function makeGetMethod(field: string): string
{
    return ORM_GET_METHOD_PREFIX + capitalize(field);
}

export function getEntityFieldValue(entity: string, columnName: string): string
{
    return entity[makeGetMethod(columnName)]();
}

export function capitalize(s: string): string
{
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function camelcaseToUnderscore(camelcaseString: string): string
{
    return camelcaseString.replace(/\.?([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")
}

export function makeReferenceFieldId(fieldName: string, idFieldName: string): string
{
    return camelcaseToUnderscore(fieldName) + "_" + camelcaseToUnderscore(idFieldName);
}
