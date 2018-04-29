import q from 'q';

export default (context, next, finish) => {
    context.set('startTimestamp', Date.now());
    next();
}