'use strict'

var fs = require('fs');
var seneca = require('seneca')();
var async = require('async');

var countries = JSON.parse(fs.readFileSync('./data/countries.json', 'utf8'));
var plugin = "load-countries";
var config = require('config');
var ENTITY_NS = "cd/countries";

seneca.use('mongo-store', config.db)

seneca.ready(function() {
  seneca.add({ role: plugin, cmd: 'insert' }, function (args, done) {

    function createCountries(country, cb){
      seneca.make$(ENTITY_NS).save$(country, function(err, response) {
        if(err){
          return cb(err);
        }

        return cb(null, response);
      });
    }

    var loadCountries = function (done) {
      async.eachSeries(countries, createCountries , done);
    };

    async.series([
      loadCountries
    ], done);

  });

  seneca.act({ role: plugin, cmd: 'insert', timeout: false }, function(err){
    if(err){
      throw err;
    } else{
      console.log("complete");
    }   
  });
  
});