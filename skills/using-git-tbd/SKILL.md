---
name: using-git-tbd
description: Use when …
author: …
version: 1.0.0
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
| Lanzamiento de Releases (Branch for Release) | `references/releases.md` | Cortar rama de release (Release Branches), taggear release, despliegue a producción |
| Solución de Bugfix / Hotfix | `references/hotfixes.md` | Cortar rama de hotfix, solucionar hotfix, fusionar hotfix a main, aplicar el fix a la rama de release (Cherry-pick) |


Referencias externas:
* [Trunk-Based Development](https://trunkbaseddevelopment.com)
* [Trunk-Based Development: Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)
* [Trunk-Based Development for Beginners](https://ingram.technology/blogs/20-11-2024-trunk-based-development-for-beginners.htm)
