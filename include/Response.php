<?php

namespace Pochi\FM;

class Response {
    static private $values = null;

    static function json($values) {
        self::$values = $values;
        exit;
    }

    static function shutdown() {
        $error = error_get_last();
        header('Content-Type: application/json; charset=utf-8');

        if ($error !== null) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $error['message']
            ]);
        } else if(self::$values !== null){
            echo json_encode(self::$values);
        }
    }

    static function exception($e) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Exception
set_exception_handler(function($e) {Response::exception($e);});

register_shutdown_function(function () {Response::shutdown();});