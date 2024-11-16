const errorResponse = (res, err) => {
    const status =  (err.status)? err.status : 500;

    if(status === parseInt(500)){
        return res.status(status).json(
            {
                name: 'internalServerError',
                status: status,
                message: 'an internal server error occured, please reach out to your supervisor or a member of the dev team',
                error: err
            }
        );
    
    }

    return res.status(status).json(
        {
            name: (err.name)? err.name : 'internalServerError',
            status: status,
            message: (err.message)? err.message : 'something went wrong'
        }
    );
};

const successResponse = (res, data, message) => {
    const status = 200;
    return res.status(status).json({
        status: 1,
        message,
        data
    });
}

module.exports = {
    errorResponse,
    successResponse
}