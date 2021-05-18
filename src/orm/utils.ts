const ORM_GET_METHOD_PREFIX = 'get';

export function makeGetMethod(field)
{
    return ORM_GET_METHOD_PREFIX + capitalize(field);
}

export function getEntityFieldValue(entity, columnName)
{
    return entity[makeGetMethod(columnName)]();
}

export function capitalize(s)
{
    if(typeof s !== 'string' && s.length > 0)
        return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function camelcaseToUnderscore(camelcaseString)
{
    return camelcaseString.replace(/\.?([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")
}

export function makeReferenceFieldId(fieldName, idFieldName)
{
    return camelcaseToUnderscore(fieldName) + "_" + camelcaseToUnderscore(idFieldName);
}
