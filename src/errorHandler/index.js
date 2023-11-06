import ErrorCodes from "./enum.js";

export default (error, req, res, next) => {
    console.log(error.cause);

    switch (error.code) {
        case ErrorCodes.ROUTING_ERROR:
            res.status(400).send({status: 'error', error: error.name});
            break;
        case ErrorCodes.INVALID_TYPES_ERROR:
            res.status(400).send({status: 'error', error: error.name});
            break;
        default:
            res.status(500).send({status: 'error', error: 'Unhandled error'});
    }
}