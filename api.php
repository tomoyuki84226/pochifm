<?php

namespace Pochi\FM;

require_once 'include/Response.php';
require_once 'include/function.php';

$config = require 'config.php';

session_start();

$pathInfo = rtrim(getenv('PATH_INFO'), '/');

if ($pathInfo == '/upload') verified($config) && upload($config);
if ($pathInfo == '/login') login($config);
if ($pathInfo == '/available') available($config);
if ($pathInfo == '/rename') verified($config) &&  renameFile($config);
if ($pathInfo == '/remove') verified($config) &&  removeFile($config);
