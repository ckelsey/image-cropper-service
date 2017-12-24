# Image variant/cropper

For generating variants of shot with GeForce images. Images must have Ansel metadata or will reject the image.

Runs on port 13463, but can be changed in ./app.js

Makes an unscaled, slightly encoded large image, a scaled preview, and an unwarped/single eye thumbnail with the specified dimensions/crop

## Install
  Must have nodejs installed, recommended to use nvm: https://github.com/creationix/nvm

  Install prereqs from here https://github.com/Automattic/node-canvas#installation

  Install ImageMagick for your OS

  May need to run `yum install gcc-c++`

  `npm i pm2 -g`

  `cd to/repo/dir && npm i && pm2 start server.json`

## Endpoint /v1/variants

  Downloads the image from the supplied url, creates a large, small and thumbnail variants from the supplied options and uploads to a specified S3 bucket

  You must create a s3.config.json file in the root of the repo. There is an example called s3.config.example.json

  Query string if method is GET, or post params

    **image**: path to image, required

    **name**: base file name including extension. Default generated string

    **path**: the path to put the variant files on S3. Default "/"

    **360**: boolean, if the image is a 360 or not. Default false

    **view_width**: for thumbnail, the width of the original canvas viewer. Default 4096 for 360, else width of image

    **view_height**: for thumbnail, the height of the original canvas viewer. Default 2048 for 360, else height of image

    **width**: for thumbnail, the width of the cropped area. Default view_width

    **height**: for thumbnail, the height of the cropped area. Default view_height

    **x**: for thumbnail, the left position of the cropped area. Default 0

    **y**: for thumbnail, the top position of the cropped area. Default 0

    **z**: for thumbnail, the zoom position of the cropped area. Default 0.5

    **pan**: for thumbnail, the left position of the image if zoomed in. Default 0

    **tilt**: for thumbnail, the top position of the image if zoomed in. Default 0

    **pixel_ratio**: for thumbnail, the devicePixelRatio of the device in which the crop measurements were take. Default 2

## Form data

  **image**: The image file

  **partindex**: The 0 based index of the chunk uploaded

  **totalparts**: The number of chunks that will be uploaded

  **totalfilesize**: Total file size of the whole image

  **id**: An id to associate the file to. Used for resumable uploads

  **pan**: If zoomed in, the x axis of the source image

  **tilt**: If zoomed in, the y axis of the source image

  **viewWidth**: Width of the canvas

  **viewHeight**: Height of the canvas

  **zoom**: Zoom amount

  **x**: The x amount to crop the image

  **y**: The y amount to crop thee image

  **width**: The width of the crop section

  **height**: The height of the crop section