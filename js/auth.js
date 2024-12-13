var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require('path'); 


var clientID = "8570d3e55e674d168d847848de809303";
var clientSecret = "e81c033055ad4b3ab61df3980d834fb7";
var redirect_uri = "http://127.0.0.1:5500/public/index.html"; 

const generateRandomString = (length) => {
    return crypto
        .randomBytes(60)
        .toString('hex')
        .slice(0, length);
}

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/../public'))
    .use(cors())
    .use(cookieParser());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });

app.get('/login', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    var scope = "user-read-private user-read-email playlist-read-private user-read-playback-position user-top-read";
    res.redirect('https://accounts.spotify.com/authorize?' + 
        querystring.stringify({
            response_type: 'code',  
            client_id: clientID,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/public', function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if( state === null || state !== storedState) {
        res.redirect('/#' + querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'content-type' : 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64')
            },
            json:true
        };
        request.post(authOptions, function(error, response, body) {
            if(!error && response.statusCode === 200) {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: {'Authorization': 'Bearer ' + access_token},
                    json: true
                };

                request.get(options, function(error, response, body) {
                    console.log(body);
                });

                res.redirect('/#' + querystring.stringify({
                    access_token: access_token,
                    refresh_token: refresh_token
                }));

            } else {
                res.redirect('/#' + querystring.stringify({
                    error: 'invalid_token'
                }));
            }
        });
    }
});

app.get('/refresh_token', function(req, res) {
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'content-type' : 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64')
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if(!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

console.log('Listening on port 8888');
app.listen(8888);
