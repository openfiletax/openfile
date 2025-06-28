Flamingo Fact Checker
=====================

`Flamingo Fact Checker (zip file in utils directory) <../../utils/>`__
is a chrome extension to assist devs with tracking facts as they move
through the UI.

Features
--------

-  Fact tracking - View fact values live on screen.
-  Live facts - shows the facts associated with the fields on the page
   currently being viewed.
-  Telescope - View fact documentation and live values of the
   dependencies inline. Requires environment variable
   ``VITE_ENABLE_FLAMINGO_TELESCOPE`` to be set to true.
-  Import / Export of factgraph - click on the extension button in
   Chrome to robustly import or export a factgraph.
-  Import / Export of fact names - click on the extension button in
   Chrome to track a group of facts.

How to install
--------------

1. Get the latest release zip
2. Extract the zip, it should create a folder named flamingo
3. Go to ``chrome://extensions/``
4. Enable developer mode
5. Click on “Load unpacked”, navigate to the folder and click select
6. Go to directfile on `localhost <http://localhost>`__ and it should
   load.

How to update
~~~~~~~~~~~~~

1. Get the latest release zip
2. Extract the zip, it should create a folder named flamingo
3. Go to ``chrome://extensions/``
4. Hit the reload the button on the extension

How to enable telescope
~~~~~~~~~~~~~~~~~~~~~~~

The data for the fact definitions is rather large and I didn’t want to
force everyone to download it. So this feature is available only on
local dev and requires that you set an environment variable in your
local environment:

::

   export VITE_ENABLE_FLAMINGO_TELESCOPE=true

or start npm with it

::

   VITE_ENABLE_FLAMINGO_TELESCOPE=true npm run start

Releases
--------

v1.4.0 `flamingo_v1.4.0.zip <https://github.com/DirectFile/flamingo-fact-checker/blob/main/uploads/457d2aa5547a204b35897000246cbe84/flamingo_v1.4.0.zip>`__
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Facts truncate if too long, hover to see full name
-  Bugs with first install fixed (if rewind never seemed to work for
   you)

v1.3.0 `flamingo_v1.3.0.zip <https://github.com/DirectFile/flamingo-fact-checker/blob/main/uploads/14b80c152c2d518673e7bce8bcb65ad7/flamingo_v1.3.0.zip>`__
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Telescope into a fact and see its dependencies and their values
-  Incomplete and placeholder values now visible
-  Load and copy out your factgraph easily

v1.2.1 `flamingo_v1.2.1.zip <https://github.com/DirectFile/flamingo-fact-checker/blob/main/uploads/3107745f4a357647582746fb3a2e8a44/flamingo_v1.2.1.zip>`__
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Rewind your factgraph
-  Hotlink to collection items
-  Bugfixes

Known Issues
^^^^^^^^^^^^

-  Some collection items may have more than one hotlink and depending on
   factgraph, they may not all be visible pages.

v1.1.0 `flamingo_v1.1.0.zip <https://github.com/DirectFile/flamingo-fact-checker/blob/main/uploads/3fd9deef0cc06c1b9394babc7a4b1091/flamingo_v1.1.0.zip>`__
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Persistent fact tracking
-  Live monitor of current facts on page
