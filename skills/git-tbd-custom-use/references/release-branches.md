# Releases (Branch for Release)

A branch that only accepts commits accepted to stabilize a version of the product ready for release.


### Release Branches

When using branches for versions, an organization creates a release branch shortly before the planned date. This keeps the release branch independent from the work that goes into the main branch; after all, work on the main branch may not affect the build, but it could introduce new bugs.

```
release/1.3.0:                       *--v1.3.0--x
release/1.2.0:        *--v1.2.0--x  /
                     /             /
main:    --*--------*-------------*-------- 
            \      /             /
feature/1:   \----/             /
feature/2:    \----------------/
```

#### Release Branch Rules

* Just-in-time release branch (in Release Branches): The release branch is created just in time, typically a few days before the planned release.
* Cut point not necessarily the HEAD: It is not mandatory to cut the branch from the trunk's latest commit. An earlier commit (a known-good SHA) can be chosen to exclude changes you don't want to include in that release.
* No trunk freeze: Developers should not slow down or freeze their commits to the trunk as a release approaches. The flow of development into the trunk continues at full speed.
* No development in the release branch: Developers, as a group, do not commit directly to the release branch. This is a "no continued development work" policy.
* Cherry-pick from the trunk: Fixes the release branch needs must be cherry-picked from the trunk (never the other way around). First fix it in the trunk, then apply the fix to the release branch.
* Duplicated CI: The CI pipeline that protects the trunk should be duplicated to also protect the active release branches.
* Deletion of old branches: Old release branches should be deleted, without needing to merge them back into the trunk.
Example release

## Command flow for Release Branches (cheatsheet)

### Step 1: Update the version in main

```bash
# Position yourself on the trunk and make sure you have the latest
git checkout main
git pull origin main

# Update the version file (e.g. package.json, pom.xml, version.txt, etc.)
# Open the file, change "1.2.0" to "1.3.0" and save.

# Commit the version bump
git commit -am "chore: bump version to 1.3.0"

# Push the change to the trunk
git push origin main
```

### Step 2: Cut the release branch

```bash
# Create the release branch from the latest commit on main
git checkout -b release/1.3.0

# Push it to the remote so CI starts working
git push origin release/1.3.0
```

### Step 3: CI/CD and pre-production validations

At this point, your automated pipeline (GitHub Actions, GitLab CI, Jenkins, etc.) should be configured to:
Run maximum validations on the release/1.3.0 branch (end-to-end tests, integration, security, strict linting, etc.).
Automatically deploy the artifact built from this branch to a pre-production (staging) environment.
Run smoke and regression tests in that environment.

### Step 4: Manual validation (if applicable)

The QA or Product team validates in the pre-production environment that everything works as expected.


### Step 5: Tag the official release

```bash
# Once the release/1.3.0 branch has passed all pre-production tests, proceed to create the final tag.
# Make sure you're on the exact commit of the release branch
git checkout release/1.3.0

# Create the annotated tag (recommended over the lightweight one)
git tag -a v1.3.0 -m "Release version 1.3.0"

# Push the tag to the remote repository
git push origin v1.3.0
```

### Step 6: Deploy to production

Your CI/CD pipeline should be configured to listen for the creation of new tags (v1.3.0) and automatically deploy that artifact to production.
(Alternative): If deployment is manual, deploy from the commit pointed to by v1.3.0.

### Step 7: Clean up the release branch (no merge to main)

```bash

# Delete the remote branch (no longer needed)
git push origin --delete release/1.3.0

# Delete the local branch (optional, but recommended to keep things clean)
git branch -d release/1.3.0
```

### Step 8: Post-release (Prepare the next cycle)

```bash
git checkout main
git pull origin main
# Update the version file to 1.4.0-SNAPSHOT
git commit -am "chore: bump version to 1.4.0-SNAPSHOT"
git push origin main
```

## Command flow summary for release (cheatsheet)

```bash
# 1. Bump in main
git checkout main && git pull
# Edit version file to 1.3.0
git commit -am "chore: bump version to 1.3.0" && git push

# 2. Cut release
git checkout -b release/1.3.0 && git push origin release/1.3.0

# 3. CI/CD deploys to pre-production automatically
# 4. Validate in pre-production (all OK)

# 5. Tag
git tag -a v1.3.0 -m "Release 1.3.0" && git push origin v1.3.0

# 6. Deploy to production (automatic from the tag)

# 7. Clean up
git push origin --delete release/1.3.0 && git branch -d release/1.3.0

# 8. Prepare the next version in main
git checkout main && git pull
# Edit version file to 1.4.0-SNAPSHOT
git commit -am "chore: bump to next dev version" && git push
```


### External references:

* [Trunk-Based Development: Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)
* [Branching Patterns - Martin Fowler](https://martinfowler.com/articles/branching-patterns.html#release-branch)
