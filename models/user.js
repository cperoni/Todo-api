var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                // user.email
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });

    //Instance Methods
    User.prototype.toPublicJSON = function () {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
    };

    //Class Methods
    User.authenticate = function (body) {
        return new Promise(function (res, rej) {
            if (typeof body.email !== 'string' || typeof body.password !== 'string') {
                return rej();
            };

            User.findOne({
                where: {
                    email: body.email
                }

            }).then(function (user) {
                if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                    return rej();
                }
                res(user);
            }, function (e) {
                rej();
            });
        });
    }

    return User;
};