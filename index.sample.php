
<?php
    require 'include/common.php';
    require 'include/index.inc.php';
    $index = new \Pochi\FM\IndexController(require('config.php'));
?>
<html>
<head>
    <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
    <?php $index->writeMeta()?>
    <meta name="twitter:site" content="" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <link href="src/PochiFM.css?20260521" rel="stylesheet">
    <script src="src/PochiFM.js?20260521" defer></script>
    <style type="text/css">
        h1 {
            margin: 0;
        }
        header {
            padding: 0.5em;
            border-bottom: solid 1px gray;
        }
        html,body{
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <header>
        <h1>Pochi File Manager</h1>
    </header>
    <?php $index->writeUi()?>
    <script>
        // Setting filelist height
        function onResizeWindow() {
            const bodyHeight = window.innerHeight;
            const header = document.querySelector('header');
            const headerStyle = window.getComputedStyle(header);
            document.querySelector('main').style.height = (bodyHeight - header.offsetHeight - parseFloat(headerStyle.marginTop) - parseFloat(headerStyle.marginBottom)) + 'px';
        }
        document.addEventListener('DOMContentLoaded', onResizeWindow);
        window.addEventListener('resize', onResizeWindow)
        </script>
</body>
</html>