var express = require('express');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
    id: 1,
    description: 'meet mom for lunch',
    completed: true
}, {
    id: 2,
    description: 'go to marker',
    completed: false
}, {
    id: 3,
    description: 'make a cake',
    completed: true
}]


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

})

app.get('/', function (req, res) {

    res.send('Todo API Root');
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT);
})