<?php

namespace Pochi\FM;

/**
 * Base62 UUIDV7
 * @return string
 */
function generateUuidV7Base62() {
    // UUIDv7 
    $milli = (int)(microtime(true) * 1000);
    $bin = pack('J', $milli); // 64bit integer (Big endian)
    $timePart = substr($bin, 2); // 48bit (6 bytes)
    
    $randPart = random_bytes(10);
    
    // Virsion 7 and variant(10xx) settiing
    $randPart[0] = chr((ord($randPart[0]) & 0x0f) | 0x70); 
    $randPart[2] = chr((ord($randPart[2]) & 0x3f) | 0x80); 
    
    $uuidBin = $timePart . $randPart; // 計16 bytes (128bit)

    return encodeBase62($uuidBin);
}

/**
 * Binary to base62 string
 * @param string $binary
 * @return string
 */
function encodeBase62($binary) {
    static $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    $bytes = array_values(unpack('C*', $binary));
    $res = "";

    while (count($bytes) > 0) {
        $remainder = 0;
        $newBytes = [];
        
        foreach ($bytes as $byte) {
            $value = $byte + ($remainder * 256);
            $digit = (int)($value / 62);
            $remainder = $value % 62;
            
            if (count($newBytes) > 0 || $digit > 0) {
                $newBytes[] = $digit;
            }
        }
        $res = $chars[$remainder] . $res;
        $bytes = $newBytes;
    }
    // Padding 22 chars
    return str_pad($res, 22, '0', STR_PAD_LEFT);
}


/**
 * Create a directory that does not exist
 * @param string $path
 * @param string $mode 
 * @return bool
 */
function safeMkdir($path, $mode = '0705') {
    if (file_exists($path)) {
        return true;
    }
    return mkdir($path, $mode, true);
}

/**
 * @param string $path
 * @return bool
 */
function safeUnlink($path) {
    return !file_exists($path) || unlink($path);
}

/**
 * @param array $FILE
 * @return string|bool
 */
function getExtentionByFILE($FILE) {
    if (preg_match('/\.([a-zA-Z0-9]+)$/', $FILE['name'], $match)) {
        return $match[1];
    }
    return false;
}

/**
 * @param int $bytes
 * @oaram int $precision
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}


/**
 * Open a JSON file while locked.
 */
class JsonRewirte {
    /**
     * @var string
     */
    private $file;

    /**
     * @var resource | bool
     */
    private $fp = false;

    /**
     * @var bool
     */
    private $gzip;

    /**
     * @param string $file
     * @param bool $gzip
     */
    public function __construct($file, $gzip = false) {
        $this->file = $gzip ? "$file.gz" : $file;
        $this->gzip = $gzip;
    }

    /**
     * return bool
     */
    public function lock() {
        $this->fp = fopen("{$this->file}.lock", 'a');
        if (!$this->fp) {
            throw new \Exception("Can not open {$this->file}.lock");
        }
        return flock($this->fp, LOCK_EX);
    }

    /**
     * @param string $default
     * @return string
     */
    public function get($default = '[]') {
        $content = file_exists($this->file) ? file_get_contents("compress.zlib://{$this->file}") : $default;
        return json_decode($content, true);
    }

    /**
     * @param array $array
     * @param int $option json_encode() option
     * @return bool
     */
    public function save($array, $option = null) {
        $json = json_encode($array, $option);
        $tmpfile = "{$this->file}.".date('YmdHisu');
        if ($this->gzip) {
            if (!file_put_contents("compress.zlib://{$tmpfile}", $json)) return false;
        } else {
            if (!file_put_contents($tmpfile, $json)) return false;
        }
        $result = rename($tmpfile, $this->file);
        if ($this->fp) {
            flock($this->fp, LOCK_UN);
            fclose($this->fp);
            unlink("{$this->file}.lock");
        }
        return $result;
    }
}
