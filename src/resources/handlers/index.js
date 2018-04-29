import initHandler from './init-handler';
import lastHandler from './last-handler';
import modelTransaction from './model-transaction';

var handlersMap = {
    'init-handler': initHandler,
    'last-handler': lastHandler,
    'model-transaction': modelTransaction,
}

export {handlersMap}