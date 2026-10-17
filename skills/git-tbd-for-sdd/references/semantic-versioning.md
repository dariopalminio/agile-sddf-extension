# Semantic Versioning

Semantic Versioning 2.0.0 is a versioning scheme for software that aims to convey meaning about the underlying changes with each new release. It uses a three-part version number: `MAJOR.MINOR.PATCH`.

## Version Numbering

- **MAJOR** (1.0.0 → 2.0.0): version when you make incompatible API changes, if the change breaks the API Contract (removing endpoints, changing response formats, renaming required parameters, or altering authentication methods) or creates any type of incompatibility (e.g., incompatible with previous versions).
- **MINOR** (1.0.0 → 1.1.0): version when you add functionality in a backward-compatible manner (e.g., new endpoints, adding optional request fields, or expanding response data).
- **PATCH** (1.0.0 → 1.0.1): version when you make backward-compatible bug fixes (e.g., correcting error responses or fixing validation logic).

## Example

```
1.4.2
```
- `1` is the MAJOR version
- `4` is the MINOR version
- `2` is the PATCH version

## Conventional Commit Type versus Semantic Versioning

- `feat` --> MINOR
- `fix` --> PATCH
- `refactor!` --> MAJOR
- `feat!` --> MAJOR
- `fix!` --> MAJOR 
- `BREAKING CHANGE` --> MAJOR
- `hotfix` --> PATCH
- `perf` --> PATCH
- `refactor` --> PATCH
- `revert` --> PATCH
- `build` --> PATCH
- `chore` --> PATCH
- `docs` --> PATCH
- `ci` --> PATCH
- `test` --> PATCH
- `style` --> PATCH

# Updating Version in package.json with npm

```bash
npm version patch
npm version minor
npm version major
```

## External References

- **Semantic Versioning**: Use "Semantic Versioning 2.0.0" [Semantic Versioning 2.0.0](https://semver.org/) and update the version (in package.json) before merging to main.

