# Git-npm

This is a terrible little hack that uses Git submodules to pull your npm deps.

## Install

Clone the repository and install dependencies **without npm**.

```shell
git clone --recurse-submodules -j8 git@github.com:christianbundy/git-npm.git
cd git-npm
node test
```

## Usage

See more options with the `git-npm` command.

```console
$ ./bin/git-npm --help
Usage: git-npm [options]

Commands:
  git-npm install           Install dependencies from package.json
  git-npm add <moduleName>  Add a module to node_modules and package.json

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
```

## License

AGPL-3.0
