<?php

namespace Pochi\FM;

require_once dirname(__FILE__) . '/common.php';

class IndexController {
    /**
     * @var array|null
     */
    protected $targetFile = null;

    /**
     * @var string|null
     */
    protected $targetId = null;

    /**
     * @var array
     */
    protected $config;

    /**
     * @param array $config
     */
    public function __construct($config) {
        $this->config = $config;
        if ($this->targetId = $_GET['id'] ?? null) {
            $jsonFile = new JsonRewirte("{$this->config['json_dir']}/files.json", true);
            $json = $jsonFile->get();
            $json = array_values(array_filter($json, fn($file) => $file['id'] == $this->targetId));
            if (count($json)){
                $this->targetFile = $json[0];
            }
        }
    }

    // Open Graph ProtocolおよびX(twitter)カードのタグを生成する
    // Generate Open Graph Protocol and X (Twitter) card tags
    public function writeMeta() {
        if ($this->targetFile) {
            $filename = "{$this->targetFile['name']}.{$this->targetFile['ext']}";
            $basepath = htmlspecialchars((empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']));
            $url = htmlspecialchars($basepath . "?id={$this->targetFile['id']}");
            $thumbnail = htmlspecialchars($basepath . $this->config['thumb_dir'] . "/{$this->targetFile['dir']}/{$this->targetFile['id']}.jpg");
            $description = htmlspecialchars("{$filename}; type: {$this->targetFile['type']}; size: " . formatBytes($this->targetFile['size']));
            $filename = htmlspecialchars($filename);
        ?>
            <title><?=$filename?> - <?=$this->config['page_title']?></title>
            <meta property="og:title" content="<?=$filename?>" />
            <meta property="og:description" content="<?=$description?>" />
            <meta property="og:image" content="<?=$thumbnail?>" />
            <meta property="og:url" content="<?=$url?>" />
            <meta property="og:type" content="website" />
		
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="<?=$filename?>" />
            <meta name="twitter:description" content="<?=$description?>" />
            <meta name="twitter:image" content="<?=$thumbnail?>" />
        <?php } else {?>
            <title><?=$this->config['page_title']?></title>
        <?php }
    }

    // このメソッドをページ上に挿入した上で、PochiFM.jsとPochiFM.cssを読み込ませるとアプリケーションを起動できる。
    // By inserting this method into the page and then loading PochiFM.js and PochiFM.css, you can launch the application.
    public function writeUi($id = 'PochiFM') {
        $config = [
            'rootId' => $id,
            'apiPath' => $this->config['api_path'],
            'jsonDir' => $this->config['json_dir'],
            'orgDir' => $this->config['org_dir'],
            'thumbDir' => $this->config['thumb_dir'],
            'pageTitle' => $this->config['page_title'],
            'targetFile' => $this->targetFile ? $this->targetFile : false,
            'readOnly' => $this->config['readonly'] ? true : false
        ];
        ?>
        <div id="<?=$id?>" class="PochiFM">
            <input type="file" id="file-input" multiple accept="image/*" style="display:none" />
            <main>
                <section class="file-list"></section>
            </main>
            <template class="template-file">
                <article>
                    <p class="thumbnail"><img loading="lazy"></p>
                    <p class="filename"></p>
                </article>
            </template>
            <section class="progress" style="display:none"></section>
            <template class="progress-item">
                <dl>
                    <dt></dt>
                    <dd></dd>
                </dl>
            </template>
            <div class="modal file-viewer" style="display:none">
                <h2></h2>
                <section class="screen"></section>
                <button class="prev">&lt;</button>
                <button class="next">&gt;</button>
                <button class="close">✕</button>
            </div>
            <div class="modal authenticate" style="display:none">
                <section class="content">
                    <button class="close">✕</button>
                    <h2>Pochi File Manager Login</h2>
                    <p><label>Username <input type="text" name="username" value=""></label></p>
                    <p><label>Password <input type="password" name="password" value=""></label></p>
                    <button type="button" name="submit">Authenticate</button>
                </section>
            </div>
            <ul class="context-menu">
                <li>Reame</li>
                <li>Download</li>
                <li>Remove</li>
            </ul>
        </div>
        <script>
             document.addEventListener('DOMContentLoaded', function() {
                createPochiFm(<?=json_encode($config)?>);
            });
        </script>
<?php }
}


