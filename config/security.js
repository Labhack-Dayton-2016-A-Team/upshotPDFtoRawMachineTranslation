/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// security.js
var secure     = require('express-secure-only'),
  csrf         = require('csurf'),
  cookieParser = require('cookie-parser'),
  rateLimit    = require('express-rate-limit'),
  helmet       = require('helmet');

module.exports = function (app) {

  // 1. redirects http to https
  app.use(secure());

  // 2. helmet with defaults
  app.use(helmet());
  app.use(helmet.frameguard('allow-from', 'https://docs.google.com'));

  // 3. setup cookies
  var secret = Math.random().toString(36).substring(7);
  app.use(cookieParser(secret));

  // 4. csrf
  var csrfProtection = csrf({ cookie: true });
  app.get('/', csrfProtection, function(req, res, next) {
    req._csrfToken = req.csrfToken();
    next();
  });

  // 5. rate limiting
  var limiter = rateLimit({
    windowMs: 60 * 1000, // seconds
    delayMs: 0,
    max: 5,
    message: JSON.stringify({
      error:'Too many requests, please try again in 30 seconds.',
      code: 429
    }),
  });


  // 3. rate limiting.
  app.use('/api/', csrfProtection, limiter);
};
