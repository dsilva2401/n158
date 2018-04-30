import q from 'q';

export default (context, next, finish) => {
    var CurrentModel = context.params.model;
    var model = new CurrentModel(context.params.db);

    var resolveParamPath = (obj, paramPath) => {
        var buffObj = obj;
        paramPath.split('.').forEach((k) => {
            // buffObj = (typeof buffObj[k] == 'undefined') ? {} : buffObj[k];
            switch (typeof buffObj[k]) {
                case 'undefined':
                    buffObj = null;
                break;
                case 'object':
                    buffObj = JSON.parse(JSON.stringify(buffObj[k]));
                break;
                default:
                    buffObj = buffObj[k];
                break;
            }
        });
        return buffObj;
    }

    var resolveAttributes = (value, init) => {
        var fValue;
        if (typeof value == 'object') {
            fValue = JSON.parse(JSON.stringify(value));
        } else {
            fValue = value;
        }
        if (typeof value == 'string') {
            if (value[0] == '&') {
                fValue = resolveParamPath(
                    context.req, value.substring(1, value.length)
                );
            }
        } else if (typeof value == 'object') {
            if ( !Array.isArray(value) ) {
                Object.keys(value).forEach((k) => {
                    value[k] = resolveAttributes(value[k]);
                });
            } else {
                value = value.map((item) => {
                    return resolveAttributes(item);
                });
            }
        }
        if (init) {
            return value;
        }
        return fValue;
    }

    var transactionParams = resolveAttributes(context.params.transactionParams, true);
    
    var rf = (context.params.resolveRoute ? finish : next);

    if (!model) {
        rf(404, 'Model not found');
        return;
    }
    if (!context.params.transaction) {
        rf(404, 'Transaction not found');
        return;
    }
    if (!model[context.params.transaction]) {
        rf(404, 'Model transaction not found');
        return;
    }

    model[context.params.transaction].apply(model, transactionParams).then((resp) => {
        rf(200, resp);
    }).catch((resp) => {
        rf(resp.status || 500, resp);
    });
}