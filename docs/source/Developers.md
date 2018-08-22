# Documentation for third party developers

## Creating a plugin
Creating a plugin is really simple: just use this directory structure:

```
folder
├── index.html
└── config.json
```

The config file needs to contain the following:

``` json
{
    "name": "MyAwesomePlugin",
    "file": "index.html",
    "type": "plugin",
    "height": 250,
    "width": 800
}
```

The `type` field is not currently required but reserved for future use. `name`
cannot contain any special characters as it is used as a Javascript key.
