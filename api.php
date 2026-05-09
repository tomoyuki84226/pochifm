<?php

namespace Pochi\FM;

require_once 'include/Response.php';
require_once 'include/function.php';

$config = require 'config.php';

session_start();

$pathInfo = rtrim(getenv('PATH_INFO'), '/');

if ($pathInfo == '/upload') verified() && upload($config);
if ($pathInfo == '/login') login($config);
if ($pathInfo == '/available') available();
if ($pathInfo == '/rename') verified() &&  renameFile($config);
if ($pathInfo == '/remove') verified() &&  removeFile($config);
