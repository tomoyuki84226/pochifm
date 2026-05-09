<?php

namespace Pochi\FM;

require_once dirname(__FILE__) . '/common.php';

/**
 * Verify session validity on upload
 */
function verified () {
    if (!array_key_exists('username', $_SESSION)) {
        http_response_code(403);
        exit;
    }
    return true;
}

/**
 * User account response
 */
function available() {
    Response::json(array_key_exists('username', $_SESSION) ? ['username' => $_SESSION['username']] : []);
}

/**
 * Login request
 * @param array $config
 */
function login($config) {
    foreach($config['accounts'] as $account) {
        if ($_POST['username'] == $account['username']  && $account['password'] == $config['password_encript']($_POST['password'])) {
            $_SESSION['username'] = $account['username'];
            Response::json(['username' => $account['username']]);
        }
        http_response_code(404);
        exit;
    }
}

/**
 * File upload
 * @param array $config
 */
function upload ($config) {
    if (count(array_filter($_FILES, fn($file) => $file['error']))) {
        http_response_code(400);
        Response::json([
            'success' => false,
            'message' => 'file is nothing',
            'input' => $_FILES,
        ]);
    }
    if (!array_key_exists('file', $_FILES) || !array_key_exists('thumbnail', $_FILES)) {
        http_response_code(400);
        Response::json([
            'success' => false,
            'message' => 'file is nothing',
            'input' => $_FILES,
        ]);
    }
    if (!preg_match('/image\/(jpe?g|png|webp|svg)/', $_FILES['thumbnail']['type'])) {
        http_response_code(400);
        Response::json([
            'success' => false,
            'message' => 'Irregular thumbnail',
            'input' => $_FILES,
        ]);
    }
    $ext = getExtentionByFILE($_FILES['file']);
    $ngExtentions = array_merge($config['ng_extentions'], ['php']);
    if (in_array($ext, $ngExtentions)) {
        http_response_code(400);
        Response::json([
            'success' => false,
            'message' => 'Prohibited file type:' . $ext,
            'input' => $_FILES,
        ]);
    }
    $period = date($config['files_period']);
    $orgdir = $config['org_dir'] . "/{$period}";
    $thumbdir = $config['thumb_dir'] . "/{$period}";
    $fileid = generateUuidV7Base62();
    if (!(safeMkdir($orgdir, $config['permission_mkdir']) && safeMkdir($thumbdir, $config['permission_mkdir']))) {
        http_response_code(500);
        Response::json([
            'success' => false,
            'message' => 'can not make directory'
        ]);
    }
    $orgpath = $thumbdir . "/{$fileid}.jpg";
    $thumbpath = $orgdir . "/{$fileid}.{$ext}";
    move_uploaded_file($_FILES['thumbnail']['tmp_name'], $orgpath);
    move_uploaded_file($_FILES['file']['tmp_name'], $thumbpath);

    $jsonFile = new JsonRewirte("{$config['json_dir']}/files.json", true);
    try {
        if ($jsonFile->lock()) {
            $json = $jsonFile->get();
            if ($json === null) {
                safeUnlink($orgpath);
                safeUnlink($thumbpath);
                http_response_code(500);
                Response::json([
                    'success' => false,
                    'message' => 'json perse error'
                ]);
            }
            $newData = [
                'id' => $fileid, 
                'name' => pathinfo($_FILES['file']['name'], PATHINFO_FILENAME),
                'dir' => $period,
                'ext' => $ext,
                'type' => $_FILES['file']['type'],
                'size' => $_FILES['file']['size'],
                'time' => time()
            ];
            array_unshift($json, $newData);
            $jsonFile->save($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            Response::json([
                'success' => true,
                'new' => $newData
            ]);
        }        
    } catch (\Exception $e) {
        safeUnlink($orgpath);
        safeUnlink($thumbpath);
        http_response_code(500);
        Response::json([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * rename file
 * @param array $config
 */
function renameFile ($config) {
    if (!array_key_exists('id', $_POST) || !array_key_exists('name', $_POST)) {
        http_response_code(400);
        exit;
    }
    if (preg_match('/([\/\\\:\*\?\"\<\>\|])/', $_POST['name'], $match)) {
        http_response_code(400);
        Response::json([
            'message' => "Cannot be used {$match[1]}"
        ]);
    }
    $jsonFile = new JsonRewirte("{$config['json_dir']}/files.json", true);
    try {
        if ($jsonFile->lock()) {
            $json = $jsonFile->get();
            if ($json === null) {
                http_response_code(500);
                Response::json([
                    'success' => false,
                    'message' => 'json perse error'
                ]);
            }
            foreach($json as $key => $value) {
                if ($value['id'] == $_POST['id']) {
                    $json[$key]['name'] = $_POST['name'];
                    break;
                }
            }
            $jsonFile->save($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            Response::json([
                'success' => true
            ]);
        }        
    } catch (\Exception $e) {
        http_response_code(500);
        Response::json([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * remove file on disk
 * @param array $config
 */
function removeFile ($config) {
    if (!array_key_exists('ids', $_POST)) {
        http_response_code(400);
        return;
    }
    $ids = explode(',',$_POST['ids']);
    $jsonFile = new JsonRewirte("{$config['json_dir']}/files.json", true);
    try {
        if ($jsonFile->lock()) {
            $json = $jsonFile->get();
            if ($json === null) {
                http_response_code(500);
                Response::json([
                    'success' => false,
                    'message' => 'json perse error'
                ]);
            }
            $success = [];
            $fail = [];
            foreach($json as $key => $value) {
                if (in_array($value['id'], $ids)) {
                    $orgdir = "{$config['org_dir']}/{$value['dir']}/{$value['id']}.{$value['ext']}";
                    $thumbdir = "{$config['thumb_dir']}/{$value['dir']}/{$value['id']}.jpg";
                    if (safeUnlink($orgdir) && safeUnlink($thumbdir)) {
                        $json = array_filter($json, fn($file) => $file['id'] != $value['id']);
                        $success[] = $value;
                    } else {
                        $fail[] = $value;
                    }
                }
            }
            $jsonFile->save(array_values($json), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            Response::json([
                'success' => array_map(fn($file) => $file['id'], $success),
                'fail' => $fail
            ]);
        }        
    } catch (\Exception $e) {
        http_response_code(500);
        Response::json([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}