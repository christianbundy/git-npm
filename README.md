# Git-npm Example

This is a terrible little hack that uses Git submodules to pull your npm deps.

## Usage

Clone the repository and install dependencies **without npm**.

```shell
git clone --recurse-submodules -j8 git@github.com:christianbundy/git-npm-example.git
cd git-npm-example
node index.js
```

If you want to change dependencies, edit `package.json` and run:

```shell
node git-npm.js
```

## License

AGPL-3.0

