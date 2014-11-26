# holodeck

<a href="http://apostrophenow.org/"><img src="https://raw.github.com/punkave/holodeck/master/logos/logo-box-madefor.png" align="right" /></a>

Bombard your webserver with the same requests found in an existing common log format (CLF) log file, such as an Apache or Nginx log file. The requests are delivered in the same order, with the same timing. Think of it as a holodeck simulation for websites. Ideally, they can't tell the difference.

## Install

```
npm install -g holodeck
```

## Usage

```
holodeck http://mysite.example.com /path/to/access.log
```

That will hit the site `mysite.example.com` with the requests that are logged in the existing server log file `/path/to/access.log`.

## Options

If your log file is from an extremely active site, you may need to send more than 200 simultaneous requests to accurately simulate it. `--max-sockets=500` will let you send up to 500 requests at a time, rather than the default of 200.

You may want to skip sending requests for certain file extensions. Use `--ignore-extensions=gif,jpg,png` to do that. In this example we ignore those three extensions only.

For convenience, `--ignore-static` is equivalent to `--ignore-extensions=gif,jpg,png,js,xlx,pptx,docx,css,ico,pdf`.

## Limitations

* The CLF parsing is pretty basic and won't cope if you have extra fields before the regular fields (at the end is OK).

* There is no support for automatically farming out requests to multiple machines to more accurately simulate traffic from many machines.

* Only GET requests are simulated. It would be easy to simulate the HEAD requests as well. Since the contents of a POST request are not logged in CLF those cannot be simulated.

* The entire log file is read into memory, parsed into objects, and sorted by datestamp, so you could run out of memory if you run this with a large log file. This is necessary because typical webservers write entries out of order to their log files, but there's a more efficient way I'm sure.

* Any errors from node (rather than the webserver) result in the entire simulation run halting with an error. There shouldn't be any, and you certainly want to know if there are. Then again I'm running this with relatively tame log files.

* The user agent is not configurable. Your webserver might treat it differently than a regular browser.

## Changelog

0.1.0: initial release. Happy Thanksgiving Eve (US).

## About P'unk Avenue and Apostrophe

`holodeck` was created at [P'unk Avenue](http://punkave.com) for use in testing websites built with Apostrophe, an open-source content management system built on node.js. `holodeck` isn't mandatory for Apostrophe and vice versa, but they play very well together. If you like `holodeck` you should definitely [check out apostrophenow.org](http://apostrophenow.org). Also be sure to visit us on [github](http://github.com/punkave).

## Support

Feel free to open issues on [github](http://github.com/punkave/holodeck).

<a href="http://punkave.com/"><img src="https://raw.github.com/punkave/holodeck/master/logos/logo-box-builtby.png" /></a>
