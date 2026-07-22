# Feature Development (Short-Lived Feature Branches)

**Purpose**: Develop new features for the upcoming release.

Put all work for a feature on its own branch, integrate into mainline when the feature is complete.

```
main:    --*--------*--------*-------- 
            \      /        /
feature/1:   \----/        /
feature/2:    \-----------/
```

## Rules

* Use feature/<branch-name> branches for feature development.
* **General Branch Naming Convention**: `feature/<short-description>` (e.g., `feature/user-login`).
* **Jira/Branch Naming Convention**: `feature/<ticket-id>-<short-description>` (e.g., `feature/JIRA-123-user-login`).
* Short-lived branch: A feature branch should last at most a couple of days (ideally less than 24-48 hours). If it lasts longer, it becomes a long-lived branch, which is the antithesis of TBD.
* A single developer (or pair): The branch should be worked on by a single developer (or a pair in pair programming). It should not be shared for general team development.
* Continuous Integration (CI): The branch must be verified by a CI server before its commits are integrated into the trunk.
* Keep it up to date: Before merging back to the trunk, the branch should be updated with the latest changes from the trunk (main) via a merge.
* Merge only on close: Merges into the trunk (main) are only allowed as part of closing the feature branch, just before deleting it.
* Never break the build: The golden rule is to never break the build. The trunk must always be in a "release-ready" state.

## Command flow for a feature (cheatsheet)


```bash
##############################################
#  STEP 1: CREATE THE FEATURE BRANCH
##############################################

# 1. Make sure your trunk is up to date
git checkout main
git pull origin main

# 2. Create the branch (descriptive, short name)
git checkout -b feature/feature-name

# 💡 Example: git checkout -b feature/payment-gateway



##############################################
#  STEP 2: DEVELOP (ATOMIC COMMITS)
##############################################

# Make small, semantic commits.
# ✅ Good: "feat(payment): add gateway client"
# ✅ Good: "test(payment): add unit tests for gateway"
# ❌ Bad:  "wip" or "changes" (no context)

# Example commit flow:
git add src/payment/client.js
git commit -m "feat(payment): add gateway client base"

git add src/payment/client.test.js
git commit -m "test(payment): add unit tests for gateway client"

git add src/payment/controller.js
git commit -m "feat(payment): integrate gateway into controller"



##############################################
#  STEP 3: SYNC WITH main (CRITICAL!)
##############################################

# ⚠️ DO THIS BEFORE CREATING THE PULL REQUEST (PR)
# Avoids last-minute conflicts and ensures your PR passes CI.

# Option A: Use Rebase (Linear history - RECOMMENDED in TBD)
git fetch origin main
git rebase origin/main
# (If there are conflicts, resolve them, run 'git add .' and 'git rebase --continue')

# Option B: Use Merge (Safer for beginners)
git fetch origin main
git merge origin/main --no-ff
# (If there are conflicts, resolve them, run 'git add .' and 'git commit')

# 💡 Verify everything still works locally before pushing
npm test  # (or your project's test command)



##############################################
#  STEP 4: PUSH THE BRANCH AND CREATE THE PR
##############################################

# 1. Push the branch to the remote
git push origin feature/feature-name

# 2. Go to GitHub/GitLab and create the Pull Request (PR)
#    - Clear title: "feat(payment): add gateway integration"
#    - Concise description of the change

# 3. Wait for CI to pass (Trunk Validation, Tests, Sonar, etc.)
#    If it fails, fix it in this same branch and push again.

# 4. Request Code Review (mandatory in mature teams)


##############################################
#  STEP 5: MERGE TO main
##############################################

# Once the PR is approved and CI has passed, merge it.

# In the GitHub UI, preferably use:

# ✅ "Squash and merge" (if you want a single clean commit on main)
# In commands it is:
git checkout main
git pull origin main
git merge --squash feature/feature-name
git status
git commit -m "feat: full description of the feature"
git push origin main
# In professional practice, don't type these commands. Use GitHub's green button.

# ✅ "Rebase and merge" (if you want to preserve the individual commits)
# In commands it is:
git checkout main && git pull origin main
git checkout feature/my-feature
git rebase main                    # Relocate your commits
git checkout main
git merge feature/my-feature --ff-only  # Pure fast-forward
git push origin main               # ⚠️ DANGER: Bypasses protections
# In professional practice, don't type these commands. Use GitHub's green button.

# ❌ Avoid "Create a merge commit" unless strictly necessary.

# ⚠️ NEVER merge locally and then push to main.
# Always use the repository UI to protect the trunk.

# Regardless of whether the command produces a Fast-Forward or a Merge Commit, doing git 
# merge locally and then git push origin main is STRICTLY FORBIDDEN on a 
# professional team using TBD with branch protections.

##############################################
#  STEP 6: LOCAL CLEANUP (POST-MERGE)
##############################################

# Once the PR is merged on the remote, clean up your local:

# 1. Go back to the trunk
git checkout main

# 2. Pull the updated changes (including your now-merged feature)
git pull origin main

# 3. Delete the local branch (you no longer need it)
git branch -d feature/feature-name

# 4. (Optional) Remove the remote reference from your machine
git remote prune origin
```
