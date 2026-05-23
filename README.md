<p><img src="https://github.com/tomoyuki84226/pochifm/raw/main/using.gif" width="1280" style="max-width:100%"></p>

# Pochi File Manager Instructions
## Overview
Pochi File Manager is a PHP application that can be set up instantly and allows you to easily publish files just like you would on a regular PC. Since it requires no database configuration or prior library installation, it can be easily used on shared servers. It aims to provide a comfortable experience by reducing the hassles often associated with file management through features such as drag-and-drop uploads and authentication that only appears when necessary.

## Simply Easy to Use
## I want something that's easy to use
* **No database or libraries required**

  It can be easily installed on shared servers and intranets. Because it doesn't depend on libraries, it has a low learning curve and long-term maintainability.
* **Instantly reflected with drag and drop**

  It feels just like using your regular PC. You can publish without thinking about anything.

* **No need to worry about filenames**

  It always adds a new file even if it has the same filename. You don't need to decide whether to overwrite or not. Also, the URL remains the same even if you change the name. It automatically creates thumbnails.
* **Easy Backup & Migration**

  The file structure consists of only one GZIP JSON file, so backups and migrations can be done simply by duplicating the file.

* **Easy to integrate and modify**

  It minimizes the impact on existing code, making it easy to integrate into existing code.

If you're curious, try it out in the sandbox! : https://zoyo.info/pochifmsb/

## Notes
* Operation is always confirmed using the latest web browser. Older versions may not function as expected.
* Access information logging is not yet implemented. Please use your web server's logs for security verification.
* You can upload multiple files at once. However, there is no upper limit, so uploading too many at once will cause connection errors. Please limit uploads to around 5-10 files at a time.
* The administrator who installed and operates this application assumes all responsibility for any damages incurred as a result of using it.

## Future Developments
The data structure of the specifications is stable and is intended for continued use. The internal implementation may change significantly due to improvements.

Currently, only images and videos can be uploaded, and editing is only possible on PCs. Future development well as the addition of more convenient features. Please look forward to it.

## Installation Instructions
1. Change config.sample.php to config.php.
2. Write the necessary settings in config.php (at a minimum, set account information).
3. Change index.sample.php to index.php, or use it as a reference and incorporate it.
4. Upload everything to the public directory.
5. Specify permissions so that PHP can write to the json, org, and thumb directories.
6. Open the page in your browser and drag the file into the application's display area to begin publishing the file.

# License
This software is licensed under the MIT License and can be used by anyone.

## Production & Copyright
Kisaragi Fumm
* https://zoyo.info/
* https://x.com/kisaragiz84/

Copyright (c) 2026 Kisaragi Fumm
