'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const uuid = require('uuid/v4');

const logsTable = process.env.LOGS_TABLE;
// Create a response
function response(statusCode, message) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(message)
    };
}

function sortByDate(a, b) {
    if (a.createdAt > b.createdAt) {
        return -1;
    } else return 1;
}
// FUNÇÃO PARA CRIAR UM LOG NO BD
module.exports.createLog = (event, context, callback) => {
    const reqBody = JSON.parse(event.body);

    if (!reqBody.arquivo_name ||
        reqBody.arquivo_name.trim() === '' ||
        !reqBody.bucket_name ||
        reqBody.bucket_name.trim() === ''
    ) {
        return callback(
            null,
            response(400, {
                error: 'Informe um valor para o aqruivo_name ou bucket_name'
            })
        );
    }

    const log = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        title: reqBody.title,
        body: reqBody.body
    };

    return db
        .put({
            TableName: logsTable,
            Item: log
        })
        .promise()
        .then(() => {
            callback(null, response(201, log));
        })
        .catch((err) => response(null, response(err.statusCode, err)));
};
// FUNÇAO ONDE RETORNA TODOS OS  LOGS
module.exports.getAllLogs = (event, context, callback) => {
    return db
        .scan({
            TableName: logsTable
        })
        .promise()
        .then((res) => {
            callback(null, response(200, res.Items.sort(sortByDate)));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// FUNÇÃO DE RETORNA OS LOGS QUE VC INFORMAR NA URI
module.exports.getLogs = (event, context, callback) => {
    const numberOfLogs = event.pathParameters.number;
    const params = {
        TableName: logsTable,
        Limit: numberOfLogs
    };
    return db
        .scan(params)
        .promise()
        .then((res) => {
            callback(null, response(200, res.Items.sort(sortByDate)));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// RETORNA UM UNICO LOG PELO ID
module.exports.getLog = (event, context, callback) => {
    const id = event.pathParameters.id;

    const params = {
        Key: {
            id: id
        },
        TableName: logsTable
    };

    return db
        .get(params)
        .promise()
        .then((res) => {
            if (res.Item) callback(null, response(200, res.Item));
            else callback(null, response(404, { error: 'LOG não encontrado' }));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// FUNÇÃO DE EDIÇÃO DO LOG
module.exports.updateLog = (event, context, callback) => {
    const id = event.pathParameters.id;
    const reqBody = JSON.parse(event.body);
    const { bucket_name, arquivo_name } = reqBody;

    if (!reqBody.arquivo_name ||
        reqBody.arquivo_name.trim() === '' ||
        !reqBody.bucket_name ||
        reqBody.bucket_name.trim() === ''
    ) {
        return callback(
            null,
            response(400, {
                error: 'Informe um valor para o aqruivo_name ou bucket_name'
            })
        );
    }

    const params = {
        Key: {
            id: id
        },
        TableName: logsTable,
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression: 'SET arquivo_name = :arquivo_name , bucket_name = :bucket_name',
        ExpressionAttributeValues: {
            ':arquivo_name': arquivo_name,
            ':bucket_name': bucket_name

        },
        ReturnValues: 'ALL_NEW'
    };
    console.log('Updating');

    return db
        .update(params)
        .promise()
        .then((res) => {
            console.log(res);
            callback(null, response(200, res.Attributes));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// Delete a post
module.exports.deleteLog = (event, context, callback) => {
    const id = event.pathParameters.id;
    const params = {
        Key: {
            id: id
        },
        TableName: logsTable
    };
    return db
        .delete(params)
        .promise()
        .then(() =>
            callback(null, response(200, { message: 'LOG deletadop com sucesso' }))
        )
        .catch((err) => callback(null, response(err.statusCode, err)));
};