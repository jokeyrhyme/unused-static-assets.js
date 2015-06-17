# unused-static-assets.js

compare logs to local folder and identify unused assets


## What is this?

I just whipped this up to analyse AWS Cloudfront access logs and compare them
to a local directory of assets. The idea was to establish which files were no
longer in use, so that I could remove them.


## Usage

```shell
cd local/asset/folder/to/audit
node path/to/this/project path/to/access/logs
```
