var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET /todos?completed=true
app.get('/todos', function (req, res) {
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
app.get('/todos/:id', function (req, res) {
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
app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todoItem) {
        res.json(todoItem.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
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
app.put('/todos/:id', function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todoid });

    if (_.isUndefined(matchedTodo)) {
        return res.status(404).json({ "error": "no todo find with that id" });
    }

    var schema = ['description', 'completed'];
    var body = _.pick(req.body, schema);
    var validAttribute = {};

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttribute.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttribute.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttribute);

    res.json(matchedTodo);
})

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT);
    });
});
