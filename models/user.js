var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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

    User.prototype.generateToken = function (type) {
        if (!_.isString(type)) {
            return undefined;
        }
        try {
            var stringData = JSON.stringify({ id: this.get('id'), type: type });
            var encryptedData = cryptojs.AES.encrypt(stringData, '12345678').toString();
            var token = jwt.sign({
                token: encryptedData
            }, 'qwerty098');

            return token;
        } catch (e) {
            console.error(e);
            return undefined;
        }
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
    };

    User.findByToken = function (token) {
        return new Promise(function (resolve, reject) {
            try {
                var decodedJWT = jwt.verify(token, 'qwerty098');
                var bytes = cryptojs.AES.decrypt(decodedJWT.token, '12345678');
                var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
                User.findByPk(tokenData.id).then(function (user) {
                    if (user) {
                        resolve(user);
                    } else {
                        reject();
                    }
                }, function (e) {
                    reject();
                })
            } catch (e) {
                console.error(e);
                reject();
            }
        });
    }

    return User;
};