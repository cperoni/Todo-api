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
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, { completed: true });
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, { 'completed': false });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.indexOf(queryParams.q) > -1;
        });
    }

    res.json(filteredTodos);
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

    db.todo.findByPk(todoid).then(function (todoItem) {
        todoItem.destroy();
        res.json(todoItem.toJSON());
    }, function (e) {
        res.status(404).json(e);
    });

    // var todoToDelete = _.findWhere(todos, { id: todoid });

    // if (_.isUndefined(todoToDelete)) {
    //     res.status(404).json({ "error": "no todo find with that id" });
    // } else {
    //     todos = _.without(todos, todoToDelete);
    //     res.json(todoToDelete);
    // }
})

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
