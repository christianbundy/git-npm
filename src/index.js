#!/usr/bin/env node

const { execSync } = require("child_process")
const fs = require("fs").promises
const path = require("path")
const debug = require("debug")("git-npm")
const mkdirp = require("mkdirp")
const yargs = require("yargs")

// let debug = {extend: () => () => {}}
debug.enabled = true

const parsePackage = async workingDirectory => {
  const packagePath = path.join(workingDirectory, "package.json")
  const packageString = await fs.readFile(packagePath)
  const packageObject = JSON.parse(packageString)
  return packageObject
}

const normalizeUrl = url => {
  const gitPrefix = "git+"

  url = url.trim()

  if (url.startsWith(gitPrefix)) {
    url = url.slice(gitPrefix.length)
  }
  return url
}

// TODO: Use semver to support actual range.
// Currently this takes ^1.2.3 and turns it into 1.2.3.
const normalizeVersion = version => {
  const matches = version.match(/((\d|\.)+)/)

  if (matches && matches.length) {
    return matches[0]
  } else {
    return null
  }
}

const installDependencies = async (dependencies = []) => {
  Object.entries(dependencies).forEach(async ([name, version]) => {
    installModule(name, version)
  })
}

const install = () => {
  parsePackage(process.cwd()).then(({ dependencies }) => {
    installDependencies(dependencies)
  })
}

const installModule = async (name, version) => {
  const log = debug.extend(name)
  log.enabled = true
  const url = execSync(`npm view ${name} .repository.url`).toString()
  const normalized = normalizeUrl(url)
  const targetVersion = normalizeVersion(version)
  const targetDirPath = path.join(".git-npm", name, targetVersion)
  // TODO: Remove --force
  log(`adding submodule from ${normalized}`)
  execSync(`git submodule add --force ${normalized} ${targetDirPath}`)
  const tags = execSync(`git tag`, { cwd: targetDirPath })
    .toString()
    .split("\n")
    .slice(0, -1)

  let matchingTag = tags.find(tag => normalizeVersion(tag) === targetVersion)

  if (matchingTag == null) {
    log(`No matching tags!`)
    log(`want ${version}`)
    log(`have ${tags.join(" ")}`)
    log(`Using default branch instead (sorry, I don't understand semver)`)
  } else {
    log(`${name}: checking out tag ${matchingTag}`)
    execSync(`git checkout --quiet ${matchingTag}`, {
      cwd: targetDirPath
    })
  }

  const packageObject = await parsePackage(targetDirPath)

  installDependencies(packageObject.dependencies)
  const nodeModulesDir = path.join(process.cwd(), "node_modules")
  const packagePath = path.join(nodeModulesDir, name)
  const relativeTarget = path.relative(nodeModulesDir, targetDirPath)

  fs.symlink(relativeTarget, packagePath)
    .then(() => {
      log(`Created symlink`)
    })
    .catch(err => {
      if (err.code === "EEXIST") {
        // TODO: overwrite symlinks
        log(relativeTarget)
        log(`Cowardly refusing to overwrite file with symlink`)
        // symlink already exists
      } else {
        throw err
      }
    })
}

const add = async name => {
  const version = execSync(`npm view ${name} .version`)
    .toString()
    .trim()
  const log = debug.extend("name")
  log.enabled = true

  log("writing new version to package.json")
  await installModule(name, version)
  const packageObject = await parsePackage(process.cwd())
  packageObject.dependencies[name] = version

  fs.writeFile(
    path.join(process.cwd(), "package.json"),
    JSON.stringify(packageObject, null, 2)
  )
}

const createDirs = () => {
  mkdirp.sync(path.join(process.cwd(), ".git-npm"))
  mkdirp.sync(path.join(process.cwd(), "node_modules"))
}

const main = async () => {
  yargs
    .scriptName("git-npm")
    .env("GIT_NPM")
    .help("h")
    .alias("h", "help")
    .usage("Usage: $0 [options]")
    .command(
      ["install", "$0"],
      "Install dependencies from package.json",
      () => {},
      argv => {
        install()
      }
    )
    .command(
      "add <moduleName>",
      "Add a module to node_modules and package.json",
      () => {},
      argv => {
        execSync(`mkdir -p ./.git-npm`)
        execSync(`mkdir -p ./node_modules`)
        add(argv.moduleName)
      }
    ).argv
}

main()
