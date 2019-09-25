var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 100]
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                // user.email convert to lowecase
                if (user && _.isString(user.email) && user.email.length > 0) {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });
}