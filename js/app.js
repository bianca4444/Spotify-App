var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var path = require('path'); 


var clientID = "8570d3e55e674d168d847848de809303";
var clientSecret = "e81c033055ad4b3ab61df3980d834fb7";
function onPageLoad() {
    if ( window.location.search.length > 0 ){
      handleRedirect();
    }
}

function handleRedirect(){
    let code = getCode();
}

function getCode(){
  let code = null;
  const queryString = window.location.search;
  if ( queryString.length > 0 ){
      const urlParams = new URLSearchParams(queryString);
      code = urlParams.get('code')
  }
  return code;
}

function requestAuthorization(){
  clientID = document.getElementById("clientId").value;
  clientSecret = document.getElementById("clientSecret").value;
  localStorage.setItem("clientID", clientID);
  localStorage.setItem("clientSecret", clientSecret); // In a real app you should not expose your clientSecret to the user

  let url = AUTHORIZE;
  url += "?clientID=" + clientID;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
  let body = "grant_type=authorization_code";
  body += "&code=" + code; 
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&clientID=" + clientID;
  body += "&clientSecret=" + clientSecret;
  callAuthorizationApi(body);
}

function refreshAccessToken(){
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&clientID=" + clientID;
  callAuthorizationApi(body);
}

function callAuthorizationApi(body){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientID + ":" + clientSecret));
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}
function handleAuthorizationResponse(){
  if ( this.status == 200 ){
      var data = JSON.parse(this.responseText);
      console.log(data);
      var data = JSON.parse(this.responseText);
      if ( data.access_token != undefined ){
          access_token = data.access_token;
          localStorage.setItem("access_token", access_token);
      }
      if ( data.refresh_token  != undefined ){
          refresh_token = data.refresh_token;
          localStorage.setItem("refresh_token", refresh_token);
      }
      onPageLoad();
  }
  else {
      console.log(this.responseText);
      alert(this.responseText);
  }
}

function refreshDevices(){
  callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function handleDevicesResponse(){
  if ( this.status == 200 ){
      var data = JSON.parse(this.responseText);
      console.log(data);
      removeAllItems( "devices" );
      data.devices.forEach(item => addDevice(item));
  }
  else if ( this.status == 401 ){
      refreshAccessToken()
  }
  else {
      console.log(this.responseText);
      alert(this.responseText);
  }
}

function addDevice(item){
  let node = document.createElement("option");
  node.value = item.id;
  node.innerHTML = item.name;
  document.getElementById("devices").appendChild(node); 
}

function callApi(method, url, body, callback){
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
  xhr.send(body);
  xhr.onload = callback;
}
