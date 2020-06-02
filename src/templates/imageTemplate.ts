export default function imageTemplate(imageLink: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Newtral Image Resizer</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

    <script src="//cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
  </head>
  <body>
    <div class="container" style="margin-top: 20px">
      <div class="row">
        <div class="col l8 s12 m10 offset-l2 offset-m1">
          <div class="card-panel center">
            <div class="row">
              <img
                id="image"
                class="z-depth-1"
                src="${imageLink}"
                alt="Uploaded image"
              />
            </div>

            <div class="row">
              <button class="btn waves-effect waves-light" type="submit" onclick="copyLink()">
                Copy link
                <i class="material-icons right">content_copy</i>
              </button>
              <button class="btn waves-effect waves-light" type="submit" onclick="openLink()">
                Open link
                <i class="material-icons right">link</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function copyLink() {
        const image = document.getElementById('image');

        navigator.clipboard.writeText(image.src);
      }

      function openLink() {
        const image = document.getElementById('image');

        window.open(image.src, '_blank').focus();
      }
    </script>
  </body>
</html>
`;
}
