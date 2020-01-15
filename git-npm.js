const { execSync } = require("child_process")
const fs = require("fs").promises
const path = require("path")

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
const normalizeVersion = version => version.match(/((\d|\.)+)/)[0]

const installDependencies = async (dependencies = []) => {
  Object.entries(dependencies).forEach(async ([name, version]) => {
    const url = execSync(`npm view ${name} .repository.url`).toString()
    const normalized = normalizeUrl(url)
    const targetVersion = normalizeVersion(version)
    const targetDirName = name
    const targetDirPath = path.join(".", "node_modules", targetDirName)

    // TODO: Remove --force
    console.log(`${name}: adding submodule from ${normalized}`)
    execSync(
      `git submodule add --force ${normalized} ${targetDirPath}`
    )
    const tags = execSync(`git tag`, { cwd: targetDirPath })
      .toString()
      .split("\n")
      .slice(0, -1)

    let matchingTag = tags.find(tag => normalizeVersion(tag) === targetVersion)

    if (matchingTag == null) {
      console.log("No matching tags!")
      console.log(`Wanted: ${name}@${version}`)
      console.log(`Options: ${tags.join(" ")}`)
      console.log("Using default branch instead (sorry)")
    } else {
      console.log(`${name}: checking out tag ${matchingTag}`)
      execSync(`git checkout --quiet ${matchingTag}`, {
        cwd: targetDirPath
      })
    }

    const packageObject = await parsePackage(targetDirPath)
    console.log(targetDirPath)
    console.log(packageObject.name)

    installDependencies(packageObject.dependencies)
    const nodeModulesDir = path.join(process.cwd(), "node_modules", name)

    fs.symlink(targetDirPath, nodeModulesDir)
      .then(() => {
        console.log(`${name}: created symlink`)
      })
      .catch(err => {
        if (err.code === "EEXIST") {
          // symlink already exists
        } else {
          throw err
        }
      })

    console.log(`${name}: done`)
  })
}

const main = async () => {
  // TODO: Don't depend on mkdir
  execSync(`mkdir -p ./node_modules`)

  const packageObject = await parsePackage(process.cwd())
  installDependencies(packageObject.dependencies)
}

main()
