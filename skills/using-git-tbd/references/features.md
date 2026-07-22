# Desarrollo de Features (Short-Lived Feature Branches)

**Purpose**: Develop new features for the upcoming release.

Put all work for a feature on its own branch, integrate into mainline when the feature is complete.

```
main:    --*--------*--------*-------- 
            \      /        /
feature/1:   \----/        /
feature/2:    \-----------/
```

## Reglas

* Usar ramas feature/<branch-name> para desarrollo de features.
* **General Branch Naming Convention**: `feature/<short-description>` (e.g., `feature/user-login`).
* **Jira/Branch Naming Convention**: `feature/<ticket-id>-<short-description>` (e.g., `feature/JIRA-123-user-login`).
* Rama de corta duración: La rama de feature debe durar como máximo un par de días (idealmente menos de 24-48 horas). Si dura más, se convierte en una rama de larga duración, lo cual es la antítesis de TBD.
* Un único desarrollador (o pareja): La rama debe ser trabajada por un solo desarrollador (o una pareja en programación en pares). No debe ser compartida para el desarrollo general del equipo.
* Integración continua (CI): La rama debe ser verificada por un servidor de CI antes de que los commits se integren al tronco.
* Mantenerla actualizada: Antes de fusionar de vuelta al tronco, la rama debe actualizarse con los últimos cambios del tronco (main) mediante un merge.
* Fusionar (merge) solo al cerrar: Los merges hacia el tronco (main) solo se permiten como parte del cierre de la rama de feature, justo antes de eliminarla.
* Nunca romper el build: La regla de oro es nunca romper el build. El tronco siempre debe estar en un estado "release-ready".

## Flujo en comandos para feature (cheatsheet)


```bash
##############################################
#  PASO 1: CREAR LA RAMA DE FEATURE
##############################################

# 1. Asegúrate de tener el tronco actualizado
git checkout main
git pull origin main

# 2. Crea la rama (nombre descriptivo y corto)
git checkout -b feature/nombre-de-la-feature

# 💡 Ejemplo: git checkout -b feature/payment-gateway



##############################################
#  PASO 2: DESARROLLAR (COMMITS ATÓMICOS)
##############################################

# Realiza commits pequeños y semánticos.
# ✅ Bueno: "feat(payment): add gateway client"
# ✅ Bueno: "test(payment): add unit tests for gateway"
# ❌ Malo:  "wip" o "changes" (no aportan contexto)

# Ejemplo de flujo de commits:
git add src/payment/client.js
git commit -m "feat(payment): add gateway client base"

git add src/payment/client.test.js
git commit -m "test(payment): add unit tests for gateway client"

git add src/payment/controller.js
git commit -m "feat(payment): integrate gateway into controller"



##############################################
#  PASO 3: SINCRONIZAR CON main (¡CRÍTICO!)
##############################################

# ⚠️ HAZ ESTO ANTES DE CREAR EL PULL REQUEST (PR)
# Evita conflictos de última hora y asegura que tu PR pase el CI.

# Opción A: Usar Rebase (Historial lineal - RECOMENDADO en TBD)
git fetch origin main
git rebase origin/main
# (Si hay conflictos, resuélvelos, haz 'git add .' y 'git rebase --continue')

# Opción B: Usar Merge (Más seguro para principiantes)
git fetch origin main
git merge origin/main --no-ff
# (Si hay conflictos, resuélvelos, haz 'git add .' y 'git commit')

# 💡 Verifica que todo siga funcionando localmente antes de subir
npm test  # (o el comando de tests de tu proyecto)



##############################################
#  PASO 4: SUBIR LA RAMA Y CREAR EL PR
##############################################

# 1. Sube la rama al remoto
git push origin feature/nombre-de-la-feature

# 2. Ve a GitHub/GitLab y crea el Pull Request (PR)
#    - Título claro: "feat(payment): add gateway integration"
#    - Descripción concisa del cambio

# 3. Espera a que el CI pase (Trunk Validation, Tests, Sonar, etc.)
#    Si falla, arregla en esta misma rama y haz otro push.

# 4. Solicita Code Review (obligatorio en equipos maduros)


##############################################
#  PASO 5: FUSIONAR (MERGE) A main
##############################################

# Una vez aprobado el PR y pasado el CI, fusiónalo.

# En la interfaz de GitHub, usa preferentemente:

# ✅ "Squash and merge" (si quieres un solo commit limpio en main)
# En comandos es:
git checkout main
git pull origin main
git merge --squash feature/nombre-de-la-feature
git status
git commit -m "feat: descripción completa de la feature"
git push origin main
# En la práctica profesional, no escribas estos comandos. Usar el botón verde de GitHub.

# ✅ "Rebase and merge" (si quieres preservar los commits individuales)
# En comandos es:
git checkout main && git pull origin main
git checkout feature/mi-feature
git rebase main                    # Reubica tus commits
git checkout main
git merge feature/mi-feature --ff-only  # Fast-forward puro
git push origin main               # ⚠️ PELIGRO: Salta protecciones
# En la práctica profesional, no escribas estos comandos. Usar el botón verde de GitHub.

# ❌ Evita "Create a merge commit" a menos que sea estrictamente necesario.

# ⚠️ NUNCA hagas el merge localmente y luego pushes a main.
# Siempre usa la interfaz del repositorio para proteger el tronco.

# Independientemente de si el comando genera un Fast-Forward o un Merge Commit, hacer git 
# merge localmente y luego git push origin main está TERMINANTEMENTE PROHIBIDO en un 
# equipo profesional que use TBD con protecciones de rama.

##############################################
#  PASO 6: LIMPIEZA LOCAL (POST-MERGE)
##############################################

# Una vez que el PR está fusionado en remoto, limpia tu local:

# 1. Vuelve al tronco
git checkout main

# 2. Trae los cambios actualizados (incluyendo tu feature ya fusionada)
git pull origin main

# 3. Elimina la rama local (ya no la necesitas)
git branch -d feature/nombre-de-la-feature

# 4. (Opcional) Elimina la referencia remota de tu máquina
git remote prune origin
```
