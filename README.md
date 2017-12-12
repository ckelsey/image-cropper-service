# Image variant/cropper

For generating variants of shot with GeForce images. Images must have Ansel metadata or will reject the image.

Runs on port 13463, but can be changed in ./app.js

Makes an unscaled, slightly encoded large image, a scaled preview with a width of 1080px, and an unwarped/single eye thumbnail with the specified dimensions/crop

## Form data

**image** The image file

**partindex** The 0 based index of the chunk uploaded

**totalparts** The number of chunks that will be uploaded

**totalfilesize** Total file size of the whole image

**id** An id to associate the file to. Used for resumable uploads

**pan** If zoomed in, the x axis of the source image

**tilt** If zoomed in, the y axis of the source image

**viewWidth** Width of the canvas

**viewHeight** Height of the canvas

**zoom** Zoom amount

**x** The x amount to crop the image

**y** The y amount to crop thee image

**width** The width of the crop section

**height** The height of the crop section