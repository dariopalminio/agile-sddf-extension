# Lanzamiento de Releases (Branch for Release)

A branch that only accepts commits accepted to stabilize a version of the product ready for release.

## Estrategias de lanzamiento

Existen diferentes estrategias de lanzamiento dentro del desarrollo basado en la rama principal. Podemos lanzar directamente desde la rama principal o utilizando ramas de lanzamiento.

### Release directamente desde el tronco (main)

En el desarrollo basado en la rama principal, cada confirmación en la rama principal es publicable. Por lo tanto, es obvio que podemos publicar desde cualquier confirmación. Esto permite una alta frecuencia de lanzamiento, pero también deja el código base propenso a errores.

```
tag:     v1.1.0     v1.2.0   v1.3.0
main:    --*--------*--------*-------- 
            \      /        /
feature/1:   \----/        /
feature/2:    \-----------/
```

### Release Branches

Al usar ramas para las versiones, una organización crea una rama de lanzamiento poco antes de la fecha prevista. Esto mantiene la rama de lanzamiento independiente del trabajo que se incorpora a la rama principal; al fin y al cabo, el trabajo en la rama principal puede no afectar la compilación, pero podría introducir nuevos errores.

```
release/1.3.0:                       *--v1.3.0--x
release/1.2.0:        *--v1.2.0--x  /
                     /             /
main:    --*--------*-------------*-------- 
            \      /             /
feature/1:   \----/             /
feature/2:    \----------------/
```

#### Reglas de Release Branches

* Rama de release just-in-time (en Release Branches): La rama de release se crea justo a tiempo, típicamente unos días antes del lanzamiento planificado.
* Punto de corte no necesariamente el HEAD: No es obligatorio cortar la rama desde el último commit del tronco. Se puede elegir un commit anterior (un SHA conocido como bueno) para excluir cambios que no se quieran incluir en ese release.
* No Congelación (freeze) del tronco: Los desarrolladores no deben ralentizar ni congelar sus commits al tronco mientras se acerca un release. El flujo de desarrollo hacia el tronco continúa a máxima velocidad.
* Sin desarrollo en la rama de release: Los desarrolladores, como grupo, no commitean directamente a la rama de release. Esta es una política de "no continued development work".
* Cherry-pick desde el tronco: Los fixes que necesite la rama de release deben ser cherry-picked desde el tronco (nunca al revés). Primero se arregla en el tronco y luego se aplica el fix a la rama de release.
* CI duplicado: El pipeline de CI que protege el tronco debe duplicarse para proteger también las ramas de release activas.
* Eliminación de ramas viejas: Las ramas de release antiguas deben ser eliminadas, sin necesidad de fusionarlas de vuelta al tronco
Ejemplo lanzamiento de Release

## Flujo en comandos para Release Branches (cheatsheet)

### Paso 1: Actualizar la versión en main

```bash
# Posiciónate en el tronco y asegúrate de tener lo último
git checkout main
git pull origin main

# Actualiza el archivo de versión (ej. package.json, pom.xml, version.txt, etc.)
# Abre el archivo, cambia "1.2.0" a "1.3.0" y guarda.

# Haz el commit del bump de versión
git commit -am "chore: bump version to 1.3.0"

# Sube el cambio al tronco
git push origin main
```

### Paso 2: Cortar la rama de release

```bash
# Creas la rama de release desde el último commit de main
git checkout -b release/1.3.0

# La subes al remoto para que el CI comience a trabajar
git push origin release/1.3.0
```

### Paso 3: CI/CD y validaciones en pre-producción

En este punto, tu pipeline automático (GitHub Actions, GitLab CI, Jenkins, etc.) debe estar configurado para:
Ejecutar validaciones máximas sobre la rama release/1.3.0 (tests end-to-end, integración, seguridad, linting estricto, etc.).
Desplegar automáticamente el artefacto construido desde esta rama a un entorno de pre-producción (staging).
Ejecutar pruebas de humo y regresión en ese entorno.

### Paso 4: Validación manual (si aplica)

El equipo de QA o Producto valida en el entorno de pre-producción que todo funciona según lo esperado.


### Paso 5: Taggear el release oficial

```bash
# Una vez que la rama release/1.3.0 ha pasado todas las pruebas en pre-producción, se procede a crear el tag definitivo.
# Te aseguras de estar en el commit exacto de la rama de release
git checkout release/1.3.0

# Creas el tag anotado (recomendado sobre el ligero)
git tag -a v1.3.0 -m "Release version 1.3.0"

# Subes el tag al repositorio remoto
git push origin v1.3.0
```

### Paso 6: Despliegue a producción

Tu pipeline de CI/CD debe estar configurado para escuchar la creación de nuevos tags (v1.3.0) y desplegar automáticamente ese artefacto a producción.
(Alternativa): Si el despliegue es manual, despliegas desde el commit apuntado por v1.3.0.

### Paso 7: Limpieza de la rama de release (sin merge a main)

```bash

# Eliminas la rama remota (ya no es necesaria)
git push origin --delete release/1.3.0

# Eliminas la rama local (opcional, pero recomendado para mantener limpio)
git branch -d release/1.3.0
```

### Paso 8: Post-release (Preparar el próximo ciclo)

```bash
git checkout main
git pull origin main
# Actualizas el archivo de versión a 1.4.0-SNAPSHOT
git commit -am "chore: bump version to 1.4.0-SNAPSHOT"
git push origin main
```

## Resumen del flujo en comandos para release (cheatsheet)

```bash
# 1. Bump en main
git checkout main && git pull
# Editar archivo de versión a 1.3.0
git commit -am "chore: bump version to 1.3.0" && git push

# 2. Cortar release
git checkout -b release/1.3.0 && git push origin release/1.3.0

# 3. CI/CD despliega a pre-producción automáticamente
# 4. Validar en pre-producción (todo OK)

# 5. Taggear
git tag -a v1.3.0 -m "Release 1.3.0" && git push origin v1.3.0

# 6. Desplegar a producción (automático desde el tag)

# 7. Limpiar
git push origin --delete release/1.3.0 && git branch -d release/1.3.0

# 8. Preparar siguiente versión en main
git checkout main && git pull
# Editar archivo de versión a 1.4.0-SNAPSHOT
git commit -am "chore: bump to next dev version" && git push
```


### Referencias externas:

* [Trunk-Based Development: Branch for Release](https://trunkbaseddevelopment.com/branch-for-release/)
* [Branching Patterns - Martin Fowler](https://martinfowler.com/articles/branching-patterns.html#release-branch)
