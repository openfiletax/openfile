# OpenFile
OpenFile is a free tax tool forked from IRS Direct File. More information at https://docs.openfile.tax/en/latest/reference.html.

# Statement
This project makes no guarantees of accuracy. As of November 2025, the official Direct File project is [indefinitely suspended](https://www.nextgov.com/digital-government/2025/11/direct-file-wont-happen-2026-irs-tells-states/409309/?oref=ng-home-top-story).

# Running
OpenFile uses Docker. To run the entirety of OpenFile:

```
git clone https://github.com/openfiletax/openfile.git --recurse-submodules
docker compose up -d
```

The OpenFile client will start at `localhost:3000/df/file`.