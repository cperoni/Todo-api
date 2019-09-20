var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

sequelize.sync({
    //force: true
}).then(function () {
    console.log('everything is synced');

    Todo.findByPk(22).then(function (todo) {
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('todo not found');
        }
    })

    // Todo.create({
    //     description: 'Walking my dog'
    // }).then(function (todo) {
    //     return Todo.create({
    //         description: 'Clean Office'
    //     });
    // }).then(function () {
    //     //return Todo.findByPk(1)
    //     return Todo.findAll({
    //         where: {
    //             completed: false
    //         }
    //     });
    // }).then(function (todos) {
    //     if (todos) {
    //         todos.array.forEach(element => {
    //             console.log(element.toJSON());
    //         });
    //     } else {
    //         console.log('non ho trovato niente');
    //     }
    // }).catch(function (e) {
    //     console.log(e);
    // })
})