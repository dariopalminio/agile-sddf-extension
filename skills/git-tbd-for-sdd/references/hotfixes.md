# Bugfix / Hotfix Resolution

**Purpose**: Fix critical bugs in the live production version.

A branch to capture work to fix an urgent production defect.

```
    main
     |
     * ---> hotfix/login-timeout (cut from main)
     |           |
     |           * (fix) 
     * <---- hotfix/login-timeout (merge to main)
     |
     * ---------> cherry-pick to release/1.3.0 --> tag v1.3.1
```

## Rules

* Fix in the trunk first: The best practice is to reproduce the bug in the trunk, fix it there with a test, and wait for CI verification.
* Cherry-pick to the release branch: Once the fix is verified in the trunk, cherry-pick the commit to the release branch to ship the patch.
* Never fix directly in the release branch: Bugs should not be fixed directly in the release branch with the expectation of cherry-picking them back to the trunk. This introduces the risk of forgetting the merge and causing a regression in production.
* Create a hotfix/ branch for the fix with a PR (it is safer and auditable).
* Exception: bug not reproducible in the trunk: If the bug cannot be reproduced in the trunk, it can be fixed in the release branch, but you must be aware of the regression risk this introduces.
* "Roll-forward" strategy: For high-frequency teams (CD), a "roll-forward" strategy is preferred: the fix is made in the trunk and the next release is shipped from there, instead of creating a hotfix for an older version.
* Use of Feature Flags: To avoid hotfixes, using Feature Flags is recommended to disable problematic functionality in production without needing a new deployment.

## Cheatsheet: Hotfix (Bugfix for production)

### 1. Fix the bug in main (ALWAYS step #1)

```bash
# 1. Update the trunk
git checkout main
git pull origin main

# 2. Create a temporary branch for the hotfix (good practice, though in TBD a direct commit is allowed if trivial)
git checkout -b hotfix/login-timeout

# 3. Fix the code (edit the necessary files)
# ... (edit code) ...

# 4. Commit the fix (without changing the version yet)
git commit -am "fix(auth): resolve login timeout issue"

# 5. Push the branch and create a Pull Request (recommended) or merge it directly
git push origin hotfix/login-timeout
# (Create PR, approve, and merge to 'main')
# Or if you merge directly:
git checkout main
git merge hotfix/login-timeout --no-ff
git push origin main

# 6. WAIT for CI to pass on main (NEVER continue if the build is broken)
```

### 2. Get the SHA of the fixed commit on main

```bash
# Find the exact commit (copy the hash, e.g. "a1b2c3d")
git log -1 --oneline main
# Output: a1b2c3d fix(auth): resolve login timeout issue
```

### 3. Apply the fix to the release branch (Cherry-pick)

A cherry-pick consists of copying a commit from one branch to another, but without merging the branches. That is, only that commit is copied, not the previous ones since the branch point.

```bash
# A. If the release branch ALREADY EXISTS on the remote:
git checkout release/1.3.0
git pull origin release/1.3.0

# B. If the release branch WAS DELETED (because it had already been officially released):
#    We recreate it from the previous tag (v1.3.0) to have the exact production base.
git checkout -b release/1.3.0 v1.3.0
git push origin release/1.3.0

# C. Now, bring the fix from main via cherry-pick
git cherry-pick a1b2c3d   # <--- Replace with the real SHA from main

# ⚠️ CONFLICTS? Resolve them manually:
# git status (see conflicting files)
# (Edit files to resolve)
# git add .
# git cherry-pick --continue

# D. Push the updated release branch
git push origin release/1.3.0
```

### 4. Bump the version number (Patch) in the release branch

```bash
# 1. Edit the version file (package.json, pom.xml, VERSION.txt, etc.)
#    Change "1.3.0" to "1.3.1"

# 2. Commit the version bump (ONLY in the release branch)
git commit -am "chore: bump version to 1.3.1"
git push origin release/1.3.0

```

### 5. Create the Tag for the new patched release

```bash
# Position yourself on the exact commit of the release branch
git checkout release/1.3.0

# Create the annotated tag for the new version
git tag -a v1.3.1 -m "Hotfix release 1.3.1 - login timeout fix"

# Push the tag to the remote
git push origin v1.3.1
```

### 6. Deploy to production
Your CI/CD pipeline should be listening for the creation of the v1.3.1 tag and automatically deploy that artifact to production.
(Manual alternative): Deploy directly from the commit pointed to by v1.3.1.

### 7. Post-hotfix cleanup

```bash
# Option A: If this patch is final and you expect no more fixes for 1.3.x
git push origin --delete release/1.3.0
git branch -d release/1.3.0

# Option B: If you expect to apply more patches (e.g. 1.3.2, 1.3.3), 
#          LEAVE the release/1.3.0 branch active for future cherry-picks.
# (It is not deleted in this case)
```

### 8. (Optional) Sync the version bump on main


Since main now has the fix but still has version 1.3.0 (or 1.4.0-SNAPSHOT), you don't need to bring 1.3.1 back, because main is already numerically higher. Do not merge the release branch into main.
Just make sure that the next development on main includes the fix (it already does, because the fix was made there first).
Visual summary of the commands (Mini-Cheatsheet)

```bash
# 1. Fix in main
git checkout main && git pull
git checkout -b hotfix/issue
# ... fix ...
git commit -am "fix: description"
git push origin hotfix/issue   # → Make PR and merge to main

# 2. Cherry-pick to release
git checkout release/1.3.0 || git checkout -b release/1.3.0 v1.3.0
git cherry-pick <SHA-of-the-fix-on-main>
git push origin release/1.3.0

# 3. Version bump in release
# (edit file to 1.3.1)
git commit -am "chore: bump to 1.3.1" && git push

# 4. Tag and deploy
git tag -a v1.3.1 -m "Hotfix 1.3.1" && git push origin v1.3.1

# 5. Clean up (if no more patches are expected)
git push origin --delete release/1.3.0 && git branch -d release/1.3.0
```
