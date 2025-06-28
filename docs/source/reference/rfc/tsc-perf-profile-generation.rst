How to generate a tsc perf build
================================

1. Make sure that the normal lint steps run first to generate all the
   factgraph related stuff
2. ``cd`` into the package whose tsc build you’d like to test (probably
   df-client-app/)
3. Run ``npx tsc --generateTrace ~/my-tsc-trace-output-directory``
   replacing the output directory with whatever you’d like
4. Open chrome, in the address bar type ``chrome://tracing/``
5. Click the load button to open up the trace generated in step 3.
   (Should be a json file called ``trace.json``)
