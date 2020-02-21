'use strict';
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid/v4');

const usersTable = process.env.POSTS_TABLE;
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
// Create a post
module.exports.createUser = (event, context, callback) => {
    const reqBody = JSON.parse(event.body);

    if (!reqBody.title ||
        reqBody.title.trim() === '' ||
        !reqBody.body ||
        reqBody.body.trim() === ''
    ) {
        return callback(
            null,
            response(400, {
                error: 'Post must have a title and body and they must not be empty'
            })
        );
    }

    const user = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        userId: 1,
        title: reqBody.title,
        body: reqBody.body
    };

    return db
        .put({
            TableName: usersTable,
            Item: post
        })
        .promise()
        .then(() => {
            callback(null, response(201, user));
        })
        .catch((err) => response(null, response(err.statusCode, err)));
};
// Get all posts
module.exports.getAllUsers = (event, context, callback) => {
    return db
        .scan({
            TableName: usersTable
        })
        .promise()
        .then((res) => {
            callback(null, response(200, res.Items.sort(sortByDate)));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// Get number of posts
module.exports.getUsers = (event, context, callback) => {
    const numberOfUsers = event.pathParameters.number;
    const params = {
        TableName: usersTable,
        Limit: numberOfUsers
    };
    return db
        .scan(params)
        .promise()
        .then((res) => {
            callback(null, response(200, res.Items.sort(sortByDate)));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// Get a single post
module.exports.getUser = (event, context, callback) => {
    const id = event.pathParameters.id;

    const params = {
        Key: {
            id: id
        },
        TableName: usersTable
    };

    return db
        .get(params)
        .promise()
        .then((res) => {
            if (res.Item) callback(null, response(200, res.Item));
            else callback(null, response(404, { error: 'User not found' }));
        })
        .catch((err) => callback(null, response(err.statusCode, err)));
};
// Update a post
module.exports.updateUser = (event, context, callback) => {
    const id = event.pathParameters.id;
    const reqBody = JSON.parse(event.body);
    const { body, title } = reqBody;

    const params = {
        Key: {
            id: id
        },
        TableName: usersTable,
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression: 'SET title = :title, body = :body',
        ExpressionAttributeValues: {
            ':title': title,
            ':body': body
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
module.exports.deletePost = (event, context, callback) => {
    const id = event.pathParameters.id;
    const params = {
        Key: {
            id: id
        },
        TableName: usersTable
    };
    return db
        .delete(params)
        .promise()
        .then(() =>
            callback(null, response(200, { message: 'User deleted successfully' }))
        )
        .catch((err) => callback(null, response(err.statusCode, err)));
};