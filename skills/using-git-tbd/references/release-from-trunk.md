# Release directly from the trunk (main)

In trunk-based development, every commit on the main branch is releasable. Therefore, it's obvious that we can release from any commit. No release branches are used. The release is made directly from main. This enables a high release frequency, but it also leaves the codebase prone to errors.

```
tag:     v1        v2        v3
main:    --*--------*--------*-------- 
            \      /        /
feature/1:   \----/        /
feature/2:    \-----------/
```

Ideal for: Websites, microservices, APIs, or any system where you can deploy several times a day.

Philosophy: Every commit that reaches main is a production candidate. There are no release branches. The trunk is the release.

# Typical workflow (Continuous Deployment)

```
main:  1 --- 2 --- 3 --- 4 --- 5 --- 6 --- 7 --- 8 (automatic deployment)
        \         \         \         \
         feat1     feat2     feat3     feat4
          (merged)  (merged)  (merged)  (merged)

Every green commit on main → is deployed to production.
```

# Versioning

Typically a scheme based on the commit hash, date/time, or a sequential build number is used, not traditional semantic versions (v1.2.3).

# Production fixes

A "roll-forward" strategy is applied: the fix is made in main and deployed like any other change. No branching to patch older versions.

## CI/CD

Every merge to main runs the full pipeline and, if it passes, is automatically deployed to production.
It requires a very robust CI/CD pipeline and exhaustive automated tests.
