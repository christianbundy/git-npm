set url
git submodule | awk '{print $2}' | xargs -L 1 -I % git submodule set-url -- % git@github.com:christianbundy/git-npm.git

set branches
git submodule | awk '{print $2}' | xargs -L 1 -I % sh -c 'git submodule set-branch --branch $(printf % | cut -c2-) %'
