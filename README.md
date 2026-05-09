# Pochi File Manager Instructions
## Overview
Pochi File Manager is an application that allows anyone to easily install and publish files on a web server running PHP (version 8 or higher). Its operation is as user-friendly as a regular PC. It operates independently without relying on external libraries and can be easily integrated into other applications without worrying about impact.

## Simply Easy to Use
The user experience prioritizes ease of use. Even if a file with the same name exists, it is always created as a new file without overwriting confirmation, eliminating the need for cumbersome decisions like overwriting confirmations. Furthermore, the file URL itself does not change even if the file name is changed, so there's no need to worry about renaming files.

Uploading files is as simple as dragging and dropping them from your PC's file viewer. You don't need to worry about whether you're currently logged in; an authentication form only appears when you attempt to perform write operations such as uploading. Once authentication is complete, the operation is performed immediately. Since there is no login button by default, it doesn't detract from the appearance.

File information is managed using only one gzip-compressed JSON file, and both the server and browser refer to the same file. There's no need to manage a database, and the load is very low.

Useage: https://www.youtube.com/watch?v=OcY41j1rouw

Sandbox : https://zoyo.info/pochifmsb/

## Notes
* Operation is always confirmed using the latest web browser. Older versions may not function as expected.
* Access information logging is not yet implemented. Please use your web server's logs for security verification.
* You can upload multiple files at once. However, there is no upper limit, so uploading too many at once will cause connection errors. Please limit uploads to around 5-10 files at a time.
* The administrator who installed and operates this application assumes all responsibility for any damages incurred as a result of using it.

## Installation Instructions
1. Change config.sample.php to config.php.
2. Write the necessary settings in config.php (at a minimum, set account information).
3. Change index.sample.php to index.php, or use it as a reference and incorporate it.
4. Upload everything to the public directory.
5. Specify permissions so that PHP can write to the json, org, and thumb directories.
6. Open the page in your browser and drag the file into the application's display area to begin publishing the file.

## Future Developments
Currently, this is still experimental, so incompatible specification changes may occur.
Only images can be uploaded, and editing is only possible on a PC. Smartphones can only view files. We plan to add more features in future development. Please look forward to it.

# License
This software is licensed under the MIT License and can be used by anyone.

## Production & Copyright
Kisaragi Fumm
* https://zoyo.info/
* https://x.com/kisaragiz84/

Copyright (c) 2026 Kisaragi Fumm
