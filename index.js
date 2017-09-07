var express = require('express'),
    app = express(),
    dotenv = require('dotenv').config(),
    bodyParser = require('body-parser'),
    path = require('path'),
    request = require('request'),
    json2csv = require('json2csv'),
    fs = require('fs');

const FIELDS_ARR = ['name','about','description','name_with_location_descriptor','store_location_descriptor','category','category_list','place_type','current_location','location','hours','price_range','food_styles','overall_star_rating','restaurant_services','restaurant_specialties','parent_page'];
const NUM_API_CALLS = 500;
const RADIUS = 500;
const JURONG_EAST_COORD = [1.3339485, 103.7421645];
const YEW_TEE_COORD = [1.3957616,103.7445525];

/**
 * Set up application middleware
 */
function setup() {
  console.info('SETTING UP MIDDLEWARE');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
}

function getFieldsAsURL(fields) {
  let str = 'fields=';
  fields.map((field, i) => {
    if (i == FIELDS_ARR.length - 1) {
      // Last field has no comma
      str += field;
    } else {
      str += field + ',';
    }
  });
  return str;
}

function getFBRestaurantsURL(lat, long, radius) {
  const BASE_URL = 'https://graph.facebook.com/v2.10/search?q=&';
  const TYPE = 'type=place&';
  const CENTER = 'center=' + lat + ',' + long + '&';
  const DISTANCE = 'distance=' + radius + '&';
  const LIMIT = 'limit=25&';
  const CATEGORIES = "categories=['FOOD_BEVERAGE']&";
  const ACCESS_TOKEN = 'access_token=' + process.env.FB_ACCESS_TOKEN + '&';
  const FIELDS = getFieldsAsURL(FIELDS_ARR);

  return BASE_URL + TYPE + CENTER + DISTANCE + LIMIT + CATEGORIES + ACCESS_TOKEN + FIELDS;
}


function getFBRestaurantsNearby(url, resultArrSoFar, limit) {
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
      if (error) {
        console.error('ERROR occurred while retrieving restaurant nodes from FB:', error);
        reject(error);
      }

      if (response && response.statusCode == 200) {
        console.log('SUCCESS, Status code: ', response.statusCode);
      }

      result = JSON.parse(body);
      resultArrSoFar = resultArrSoFar.concat(result.data);

      if (result.paging) {
        if (result.paging.next && limit > 0) {
          // There's still a cursor for next results & we're still within limit
          return getFBRestaurantsNearby(result.paging.next, resultArrSoFar, limit - result.data.length).then(resolve);
        }
      }
      resolve(resultArrSoFar);
    });
  });
}

function getAllFBRestaurantsNearby(lat, long) {
  const SEARCH_QUERY_LIMIT = 250;
  const URL = getFBRestaurantsURL(lat, long, 500);
  getFBRestaurantsNearby(URL, [], SEARCH_QUERY_LIMIT).then((result) => {
    console.log("TOTAL NUM OF RESULTS: ", result.length);
    console.log(result)
    // saveAsCSV(result, FIELDS_ARR, 'YEWTEE_500s.csv');
  });
}

function saveAsCSV(dataToSave, fieldsArr, fileName) {
  try {
    let csv = json2csv({ data: dataToSave, fields: fieldsArr });
    fs.writeFile(fileName, csv, encoding='utf8', (error) => {
      if (error) {
        console.error("ERROR while writing as .csv file: ", error);
      } else {
        console.log("SUCCESSFULLY WRITTEN", fileName, "TO DISK!");
      }
    })
  } catch(error) {
    console.error("ERROR while performing JSON to CSV conversion", error);
  }
}

//===================
// RUN
//===================
setup();
getAllFBRestaurantsNearby(YEW_TEE_COORD[0], YEW_TEE_COORD[1]);
