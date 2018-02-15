# Function visualizer

This is a feeble attempt at creating a javascript grapher.  Line segments between uniformly-spaced points approximate any given function.  This approximation lends itself easily to differentiation and integration, so methods to do that are included.

My hope is to eventually write a method which can calculate and display the density cluster tree for any given function.  That just seems like an interesting problem which would utilize the ability to find the derivative well.

### File Structure
All relevant files can be found in the source folder.  Files are written in es2015 and flow and then precompiled using babel and bundled using browserify.  All assets are minified and concatenated in the dist folder.
