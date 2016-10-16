"use strict";

exports.__esModule = true;
exports.default = buildRequest;
function buildRequest(mapping) {
  return new mapping.Request(mapping.url, {
    method: mapping.method,
    headers: mapping.headers,
    credentials: mapping.credentials,
    redirect: mapping.redirect,
    body: mapping.body
  });
}