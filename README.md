# Git-npm Example

This is a terrible little hack that uses Git submodules to pull your npm deps.

I haven't built the `package.json` parser, but in the future you should be able
to run `git-npm install` and your dependencies should be downloaded and
installed without actually running `npm install` or downloading code from the
npm registry.

## Usage

Clone the repository and install dependencies **without npm**.

```shell
git clone git@github.com:christianbundy/git-npm-example.git
cd git-npm-example
git submodule update --init
node index.js
```

## License

AGPL-3.0

