# Solución de Bugfix / Hotfix

A branch to capture work to fix an urgent production defect.

```
    main
     |
     * ---> hotfix/login-timeout (cortar desde main)
     |           |
     |           * (arreglar) 
     * <---- hotfix/login-timeout (merge a main)
     |
     * ---------> cherry-pick a release/1.3.0 --> tag v1.3.1
```

## Reglas

* Arreglar en el tronco primero: La mejor práctica es reproducir el bug en el tronco, arreglarlo allí con una prueba y esperar la verificación del CI.
* Cherry-pick a la rama de release: Una vez verificado el fix en el tronco, se hace cherry-pick del commit a la rama de release para lanzar el parche.
* Nunca arreglar directamente en la rama de release: No se deben arreglar bugs directamente en la rama de release con la expectativa de cherry-pickearlos de vuelta al tronco. Esto introduce el riesgo de olvidar el merge y generar una regresión en producción.
* Crear una rama hotfix/ pare el fix con PR (es más seguro y auditable).  
* Excepción: bug no reproducible en tronco: Si el bug no se puede reproducir en el tronco, se puede arreglar en la rama de release, pero se debe ser consciente del riesgo de regresión que esto introduce.
* Estrategia de "roll-forward": Para equipos de alta frecuencia (CD), se prefiere una estrategia de "roll-forward": el fix se hace en el tronco y el siguiente release se lanza desde ahí, en lugar de crear un hotfix de una versión anterior.
* Uso de Feature Flags: Para evitar hotfixes, se recomienda el uso de Feature Flags para desactivar funcionalidades problemáticas en producción sin necesidad de un nuevo deployment

## Cheatsheet: Hotfix (Bugfix para producción)

### 1. Arreglar el bug en main (SIEMPRE el paso #1)

```bash
# 1. Actualiza el tronco
git checkout main
git pull origin main

# 2. Crea una rama temporal para el hotfix (buena práctica, aunque en TBD se permite commit directo si es trivial)
git checkout -b hotfix/login-timeout

# 3. Arregla el código (edita los archivos necesarios)
# ... (editar código) ...

# 4. Commit del fix (sin cambiar la versión aún)
git commit -am "fix(auth): resolve login timeout issue"

# 5. Sube la rama y crea un Pull Request (recomendado) o fusiónalo directamente
git push origin hotfix/login-timeout
# (Crear PR, aprobar y hacer merge a 'main')
# O si fusionas directo:
git checkout main
git merge hotfix/login-timeout --no-ff
git push origin main

# 6. ESPERA a que el CI pase en main (NUNCA continúes si el build está roto)
```

### 2. Obtener el SHA del commit arreglado en main

```bash
# Busca el commit exacto (copia el hash, ej. "a1b2c3d")
git log -1 --oneline main
# Salida: a1b2c3d fix(auth): resolve login timeout issue
```

### 3. Aplicar el fix a la rama de release (Cherry-pick)

Un cherry-pick consiste en copiar una confirmación de una rama a otra, pero sin fusionar las ramas. Es decir, solo se copia esa confirmación, no las anteriores desde el punto de bifurcación. 

```bash
# A. Si la rama de release YA EXISTE en el remoto:
git checkout release/1.3.0
git pull origin release/1.3.0

# B. Si la rama de release FUE ELIMINADA (porque ya se había lanzado oficialmente):
#    La recreamos desde el tag anterior (v1.3.0) para tener la base exacta de producción.
git checkout -b release/1.3.0 v1.3.0
git push origin release/1.3.0

# C. Ahora, traemos el fix desde main mediante cherry-pick
git cherry-pick a1b2c3d   # <--- Reemplaza con el SHA real de main

# ⚠️ ¿CONFLICTOS? Resuélvelos manualmente:
# git status (ver archivos en conflicto)
# (Editar archivos para resolver)
# git add .
# git cherry-pick --continue

# D. Sube la rama de release actualizada
git push origin release/1.3.0
```

### 4. Subir el número de versión (Patch) en la rama de release

```bash
# 1. Edita el archivo de versión (package.json, pom.xml, VERSION.txt, etc.)
#    Cambia "1.3.0" a "1.3.1"

# 2. Commit del bump de versión (SOLO en la rama de release)
git commit -am "chore: bump version to 1.3.1"
git push origin release/1.3.0

```

### 5. Crear el Tag del nuevo release parcheado

```bash
# Posiciónate en el commit exacto de la rama de release
git checkout release/1.3.0

# Crea el tag anotado para la nueva versión
git tag -a v1.3.1 -m "Hotfix release 1.3.1 - login timeout fix"

# Sube el tag al remoto
git push origin v1.3.1
```

### 6. Desplegar a producción
Tu pipeline de CI/CD debe estar escuchando la creación del tag v1.3.1 y desplegar ese artefacto a producción automáticamente.
(Alternativa manual): Despliega directamente desde el commit apuntado por v1.3.1.

### 7. Limpieza post-hotfix

```bash
# Opción A: Si este parche es definitivo y NO esperas más fixes para 1.3.x
git push origin --delete release/1.3.0
git branch -d release/1.3.0

# Opción B: Si esperas aplicar más parches (ej. 1.3.2, 1.3.3), 
#          DEJAS la rama release/1.3.0 activa para futuros cherry-picks.
# (No se elimina en este caso)
```

### 8. (Opcional) Sincronizar el bump de versión en main


Dado que main ahora tiene el fix pero aún tiene la versión 1.3.0 (o 1.4.0-SNAPSHOT), no necesitas traer el 1.3.1 de vuelta, porque main ya es numéricamente superior. No hagas merge de la rama de release a main.
Simplemente asegúrate de que el próximo desarrollo en main tenga el fix incluido (ya lo tiene, porque el fix se hizo allí primero).
Resumen visual de los comandos (Mini-Cheatsheet)

```bash
# 1. Fix en main
git checkout main && git pull
git checkout -b hotfix/issue
# ... arreglar ...
git commit -am "fix: description"
git push origin hotfix/issue   # → Hacer PR y merge a main

# 2. Cherry-pick a release
git checkout release/1.3.0 || git checkout -b release/1.3.0 v1.3.0
git cherry-pick <SHA-del-fix-en-main>
git push origin release/1.3.0

# 3. Bump de versión en release
# (editar archivo a 1.3.1)
git commit -am "chore: bump to 1.3.1" && git push

# 4. Tag y deploy
git tag -a v1.3.1 -m "Hotfix 1.3.1" && git push origin v1.3.1

# 5. Limpiar (si no se esperan más parches)
git push origin --delete release/1.3.0 && git branch -d release/1.3.0
```

