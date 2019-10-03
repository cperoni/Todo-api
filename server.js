var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middlewere.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET /todos?completed=true
app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        query.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({ where: where }).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });

})

//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoid = parseInt(req.params.id, 10);

    db.todo.findByPk(todoid).then(function (todoItem) {
        if (!!todoItem) {
            res.json(todoItem.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send(e);
    })
});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todoItem) {
        res.json(todoItem.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoid = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoid
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted == 0) {
            res.status(404).json({
                error: 'no todo with id'
            });
        } else {
            res.status(204).send();
        }
    }, function (e) {
        res.status(500).send();
    });
});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoid = parseInt(req.params.id, 10);

    var schema = ['description', 'completed'];
    var body = _.pick(req.body, schema);
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findByPk(todoid).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    });
});

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

//POST Users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (userItem) {
        res.json(userItem.toPublicJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

//POST user login
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken('authentication');

        if (token) {
            res.header('Aut', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }
    }, function () {
        res.status(401).send();
    });

});

//{ force: true }
db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT);
    });
});