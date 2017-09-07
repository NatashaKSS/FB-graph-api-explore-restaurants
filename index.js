var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    request = require('request');

const RADIUS = 500;

/* Latitude, Longitude tuples */
const JURONG_EAST_COORD = [1.3339485, 103.7421645];

/**
 * Set up application middleware
 */
function setup() {
  console.info("Setting up middleware...");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
}

function getRestaurantsNearbyFromFB(lat, long, radius) {
  //...
}

/**
 * Running application code
 */
setup();
