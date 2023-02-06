# Future plans

## In the browser
For apps with extremely high interactivity pocket will probably never be a great choice however it should be able to
* Have local UI-state and components that can update that state and re-render themselfes as appropriate.
* Cleverly cache fetch-requests to make it easy to deal with external data sources.
* Render sufficiently sophisticated templates with a developer experience that doesn't suck.

## Apps
Technically it should be possible to build pocket apps as native apps by
* Running the app code in a native thread on a raw v8 engine.
* Serving the output directly to a webview.

This should make it possible to build pocket apps for android, ios and desktop and create seamless cross-platform experiences
without the problems associated with nodejs-based mobile apps (react native) and react-in-electron setups.

## Other languages
While client-side web frameworks in other languages will be subpar for the foreseeable future due to how tightly the DOM is
integrated with javascript and how much work needs to be done to make direct dom access fast enough in webassembly.

*However* these caveats do not apply to a pocket style architecture so one could essentially build a very similar framework in
languages like rust or swift which would be really neat.