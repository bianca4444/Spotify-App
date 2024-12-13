var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require('path'); 


var client_id = "8570d3e55e674d168d847848de809303";
var client_secret = "e81c033055ad4b3ab61df3980d834fb7";
var redirect_uri = "http://127.0.0.1:5500/public/index.html";