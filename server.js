var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

//GET /todos
app.get('/todos', function (req, res) {
    res.json(todos);
})
//GET /todos/:id
app.get('/todos/:id', function (req, res) {

    var todoid = parseInt(req.params.id, 10);
    var todoToRes;

    todos.forEach(element => {
        if (element.id == todoid) {
            todoToRes = element;
        }
    });

    if (todoToRes) {
        res.json(todoToRes);
    } else {
        res.status(404).send();
    }
});

//POST /todos
app.post('/todos', function (req, res) {
    var body = req.body;
    todoNextId = todos.length + 1;

    body.id = todoNextId;
    todos.push(body);

    res.json(body);
});

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT);
});