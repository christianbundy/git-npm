# Git-npm Example

This is a terrible little hack that uses Git submodules to pull your npm deps.

## Usage

Clone the repository and install dependencies **without npm**.

```shell
git clone git@github.com:christianbundy/git-npm-example.git
cd git-npm-example
git submodule update --init
node index.js
```

If you want to change dependencies, edit `package.json` and run:

```shell
node git-npm.js
```

## License

AGPL-3.0

