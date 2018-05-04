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

    var resolveAttributes = (value) => {
        var fValue;
        if (typeof value == 'object') {
            fValue = JSON.parse(JSON.stringify(value));
        } else {
            fValue = value;
        }
        if (typeof fValue == 'string') {
            if (fValue[0] == '&') {
                fValue = resolveParamPath(
                    context.req, fValue.substring(1, fValue.length)
                );
            }
        } else if (typeof fValue == 'object') {
            if ( !Array.isArray(fValue) ) {
                Object.keys(fValue).forEach((k) => {
                    fValue[k] = resolveAttributes(fValue[k]);
                });
            } else {
                fValue = fValue.map((item) => {
                    return resolveAttributes(item);
                });
            }
        }
        return fValue;
    }

    var transactionParams = resolveAttributes(context.params.transactionParams);
    
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