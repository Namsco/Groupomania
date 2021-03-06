const User = require('../models/user-model')

const bcrypt = require('bcrypt'); 
const webToken = require('jsonwebtoken'); 


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                pseudo: req.body.pseudo,
                email: req.body.email, 
                password: hash
            });
            user.save()
                .then(() => res.status (201).json ({message: "Utilisateur enregistré ! "}))
                .catch(error => res.status (400).json ({ error}));
        }) 
        .catch(error => res.status (500).json ({ error }));

};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then( user => {
            if (!user) {
                return res.status(401).json ({ error: " Utilisateur introuvable "});
            }
            bcrypt.compare(req.body.password, user.password)
                .then( valid => {
                    if (!valid) {
                        return res.status(401).json ({ error: "Mot de passe invalide "});
                    }
                    // Si le mot de passe est correct on renvoie un Token à l'utilisateur afin que toutes les requêtes soit le plus sécurisée possible.
                    res.status(200).json({ 
                        userId : user._id, 
                        token: webToken.sign( 
                            {userId: user._id }, 
                            'RANDOM_TOKEN_SECRET', 
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch (error => res.status(500).json ({ error }));
        })
        .catch(error => res.status(500).json ({ error }));
};



