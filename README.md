# jQuery [REST API TSViewer](https://www.planetteamspeak.com/rest-api/)

Current Version: **1.0.0**

This simple jQuery plugin provides a drop-in dynamic TeamSpeak 3 Server tree - aka TSViewer - that requires **no server-side scripting language** on your end. The [Simple REST API](https://www.planetteamspeak.com/rest-api/) hosted by [Planet TeamSpeak](https://www.planetteamspeak.com/) does all the queries, sorts channels and clients and even downloads all the remote icons for you. In addition, the result is cached, so your TS3 Server is not getting hammered with requests.

All the required JavaScript and CSS files can be used directly from the [Planet TeamSpeak](https://www.planetteamspeak.com/) CDN:

    <link rel="stylesheet" href="//cdn.planetteamspeak.com/js/jquery.ts3viewer/{version}/themes/{theme}/tree.css">
    <script src="//cdn.planetteamspeak.com/js/jquery.ts3viewer/{version}/jquery.ts3viewer.min.js"></script>

We provide three different themes to match the look and feel of the official TeamSpeak 3 Client:

* `classic` - classic icons from TS3 Client releases up to version 3.0.15
* `colored` - modern colored icons introduced with version 3.0.16 in 2014 (HiDPI support)
* `mono`    - modern monochrome icons introduced with version 3.0.16 in 2014 (HiDPI support)

### Requirements

Using the default settings, the plugin with utilize the [Simple REST API](https://www.planetteamspeak.com/rest-api/) endpoints at `api.planetteamspeak.com` to gather the necessary data from a TeamSpeak 3 Server. Therefore, the server must meet the following requirements:

* The TS3 Server must report to the official server list on `weblist.teamspeak.com` and appear in the [Global Server List](https://www.planetteamspeak.com/serverlist/) on the [Planet TeamSpeak](https://www.planetteamspeak.com/) website.
* The owner of the TS3 Server must register (claim) it on the on the [Planet TeamSpeak](https://www.planetteamspeak.com/) website and enable ServerQuery connectivity in the [Control Panel](https://www.planetteamspeak.com/control/servers/).
* ServerQuery connections are initiated from `37.59.113.89`, `167.114.184.17` and `151.80.148.48` so please consider adding those IPs to the TS3 Server whitelist file.

### Installation / Configuration

To add the TSViewer to your site, simply include jQuery and the plugin on a page. Then select a container element and call the `tsviewer` method with the IP address and port number of your TeamSpeak 3 Server.

```html
<div id="ts3viewer"></div>

<script src="jquery.js"></script>
<script src="jquery.ts3viewer.js"></script>

<script>
$("#ts3viewer").tsviewer({
  host: '82.211.30.15',
  port: '9987' 
});
</script>
```

Upon initialization, the plugin takes the following options:

| Key        | Default | Optional |  Description                               |
| -----------|:-------:|---------:|--------------------------------------------|
| host       | `null`  | No       | IP address of the TeamSpeak 3 Server       |
| port       | `null`  | No       | UDP port number of the TeamSpeak 3 Server  |
| iconUrl    | ...     | Yes      | API endpoint URL for remote icon downloads |
| dataUrl    | ...     | Yes      | API endpoint URL for JSON data results     |
| serverTip  | `null`  | Yes      | Pattern for server tooltips                |
| channelTip | `null`  | Yes      | Pattern for channel tooltips               |
| clientTip  | `null`  | Yes      | Pattern for client tooltips                |

Both API endpoint URLs support variables such as `$host`, `$port` and `$icon` for individual customization. For example, if all of your remote icon files are uploaded to a webserver in PNG format, you can use an `iconURL` like this:

    https://www.domain.tld/icons/$icon.png

The `$icon` variable will be replaced by the crc32 polynomial of the icon file. This is an unsigned integer equal to the icon ID that is used as a value for the `i_icon_id` permission on a TeamSpeak 3 Server.

The tooltip patterns can be customized with several property variables taken from the JSON result. For example, this is what a server/client tooltip pattern could look like:

    Version $version on $platform

In addition, you can specify callbacks for advanced code enhancements such as context menus or drag &amp; drop.

### License
Copyright &copy; Planet TeamSpeak.<br>
Licensed under the MIT license.
