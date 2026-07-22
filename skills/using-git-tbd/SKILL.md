---
name: using-git-tbd
description: Use this skill when managing git branches, releases, or hotfixes according to the Trunk-Based Development (TBD). It enforces naming conventions and synchronization policies.
author: dariopalminio
version: 1.0.0
metadata:
  short-description: Expert guidance on Trunk-Based Development (TBD) branching and release management.
---

# Using Git TBD (Branching Strategy)

Usando Git branching con estrategia Trunk-Based Development (TBD)

## Overview

El desarrollo basado en la rama principal (Trunk-Based Development) es un modelo de ramificación en el que los desarrolladores realizan confirmaciones frecuentes en la rama principal, que siempre está lista para su lanzamiento. Existen varios estilos de desarrollo basado en la rama principal, ya sea confirmando directamente en la rama principal o utilizando ramas de características de corta duración. Se basa en la integración y entrega continuas (CI/CD) para validar que las compilaciones se realicen correctamente y que los desarrolladores no rompan el proceso de compilación.

Las características de Trunk-Based Development son:
* Existe una única rama principal (main) que actúa como trunk.
* Los desarrolladores integran cambios frecuentemente a main.
* Las ramas de feature, cuando existen, son de vida muy corta.
* Todo el CI/CD está orientado a validar y desplegar desde main.
* Se promueve realizar commits pequeños e incrementales.
* No existen ramas de develop o release que se mezclen a main.
* Los desarrolladores no hacen commits a las ramas release.
* Las ramas release se desprenden desde la rama main.
* En la rama release solo se pueden mezclar cambios desde la rama main.

## Diagrama de flujo de ramas TBD

```
    main
     |
     * ---> feature/login (desarrollo)
     * <---- feature/login * (merge)
     |
     * ---> feature/payment (desarrollo) 
     * <---- feature/payment * (merge)
     |
     * ---------> release/1.0 (cortar) --> (validar) --> tag v1.0
     |           (no se fusiona)
     |
     * ---> hotfix/auth (cortar desde main)
     |           |
     |           * (arreglar) 
     * <---- hotfix/auth (merge a main)
     |
     * ---------> cherry-pick a release/1.0 --> tag v1.0.1
```

## References

For more details, consult these reference files (loaded on demand):

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Desarrollo de Features (Short-Lived Feature Branches) | `references/features.md` | Crear ramas de feature, commitear cambios de feature, fusionarlas a main |
| Lanzamiento de Releases (Branch for Release) | `references/release-branches.md` | Cortar rama de release (Release Branches), taggear release, despliegue a producción |
| Lanzamiento desde Trunk (Continuous Deployment) | `references/release-from-trunk.md` | Publicar directamente desde main, alta frecuencia de releases |
| Solución de Bugfix / Hotfix | `references/hotfixes.md` | Cortar rama de hotfix, solucionar hotfix, fusionar hotfix a main, aplicar el fix a la rama de release (Cherry-pick) |
|  `Conventional Commits` | `references/convention.md` | Seguir la convención de commits para mantener un historial claro y estructurado |
|  Pull Request | `references/pull-request.md` | Crear y gestionar Pull Requests en GitHub |

## Estrategias de lanzamiento

Existen diferentes estrategias de lanzamiento dentro del desarrollo basado en la rama principal. Podemos lanzar directamente desde la rama principal o utilizando ramas de lanzamiento. La forma de trabajar depende directamente de la cadencia de releases que tengas.

1. Estrategia 1: Release desde trunk (Continuous Deployment): “Teams with a higher release cadence do the former [release from trunk]"
2. Estrategia 2: Release desde rama de lanzamiento (Branch for Release): “Teams with a lower release cadence do the latter [branch for release].”

La elección entre una y otra no es una cuestión de gusto, sino una decisión técnica basada en tu ciclo de entrega. Veamos cada una en detalle.


## Buenas prácticas

* **Convención de branches**: Respetar la "Convención de branches" recomendada [Conventional Branches](https://conventionalbranch.org/).
* **Convención de Commits**: Usar "Convensión de Commits" [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) para mantener un historial de commits claro y estructurado, lo que facilita la generación de changelogs y la trazabilidad de cambios.
* **Protección de ramas**: Configurar reglas en GitHub para exigir PRs y CI exitosos en main.
* **Commits atómicos**: Cada commit debe tener un propósito claro y pasar todas las pruebas localmente.
* **Pull Requests pequeños**: Una historia o PR debe ser atómica (menos de 200 líneas de cambio).
* **Versionado Semántico**: Usa "Versionado Semántico 2.0.0" [Semantic Versioning 2.0.0](https://semver.org/) y actualizar la versión (en package.json) antes del merge a main.
* Siempre actualiza tu rama fuente (main) con git pull antes de crear una nueva rama o abrir un PR para evitar conflictos.
* **Limpieza de ramas efímeras**: Eliminar ramas feat/ después de fusionarlas y ramas release/ después de publicar.
* Purpose-driven Branch Names: Each branch name clearly indicates its purpose, making it easy for all developers to understand what the branch is for.

## Git Safety Protocol

- NEVER commit secrets (.env, credentials.json, private keys).
- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- If commit fails due to hooks, fix and create NEW commit (don't amend)

Referencias externas:
* [Trunk-Based Development](https://trunkbaseddevelopment.com)
* [Trunk-Based Development: Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)
* [Trunk-Based Development for Beginners](https://ingram.technology/blogs/20-11-2024-trunk-based-development-for-beginners.htm)
