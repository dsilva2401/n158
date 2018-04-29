import q from 'q';

export default (context, next, finish) => {
    var startTimestamp = context.get('startTimestamp');
    var requestDuration = Date.now() - startTimestamp;
    finish();
}