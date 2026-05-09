<?php

return [

    // JSONファイルの保存先ディレクトリ
    // Directory to save JSON files
    'json_dir' => 'json',

    // 表示ページからapiへのパス
    // Path from the displayed page to the API
    'api_path' => 'api.php',

    // アップロードするファイルの格納先ディレクトリ
    // Directory to store the files to be uploaded
    'org_dir' => 'org',

    // サムネイル画像の格納先ディレクトリ
    // Directory for storing thumbnail images
    'thumb_dir' => 'thumb',

    // ファイルシステムの負荷を下げるために格納するファイルを日付でディレクトリで区切る
    // date() の書式を指定する
    // To reduce the load on the file system, separate the files to be stored by date and directory.
    // Specify the format of date()
    'files_period' => 'Ym',

    // 設置するページのタイトル
    // Title of the page to be installed
    'page_title' => 'Pochi File Manager',

    // ポチファイルマネージャで使用するセッションのキー
    // 同じサイトに複数設置するとき、同じ権限で使用するならば揃え、別々にするなら違う値とします。
    // Session key used by Pochi File Manager
    // When installing multiple instances on the same site, use the same value if they are used with the same permissions, and different values ​​if they are used separately.
    'app_prefix' => 'default',

    // ログインアカウントとパスワードの設定(複数指定可能)
    // Login account and password settings (multiple settings are possible)
    'accounts' => [
        ['username' => 'pochi', 'password' => 'tama']
    ],

    // 上記にパスワードを平文で記述したくないときに変換関数を指定する
    // Specify a conversion function when you don't want to write the password in plain text.
    'password_encript' => fn($pass) => $pass,

    // このアプリが作成するディレクトリのパーミッションの指定
    // Specifying permissions for directories created by this app.
    'permission_mkdir' => 0705,

    // アップロード禁止拡張子の指定(.phpはスクリプト内で定義済み)
    // Specify file extensions that are prohibited from being uploaded (.php is already defined in the script).
    'ng_extentions' => [],

    // 入力機能を表示しない
    // Do not display input interface.
    'readonly' => false,
];