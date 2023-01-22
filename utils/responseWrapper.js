const success = (responsecode, response) => {
    return {
        status: 'OK',
        responsecode,
        response
    }
};

const error = (responseCode, response) => {
    return {
        status: 'error',
        responseCode,
        response
    }
};

module.exports = { success, error };