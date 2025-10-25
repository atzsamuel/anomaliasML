# Login anomaly detection

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/samuelatz4661-4422s-projects/v0-login-anomaly-detection)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/JfprQlPXAZN)

# Detección de anomalías en eventos de login

Este repositorio contiene una aplicación Next.js que simula tráfico, recoge métricas y ejecuta un detector de anomalías de login usando un modelo de aislamiento (Isolation Forest).

El objetivo principal del proyecto es proporcionar una plataforma para experimentar con detección de anomalías en tráfico de autenticación y exponer API internas para entrenamiento, detección y control de simuladores/colección de métricas.

## Características principales

- Simulador de tráfico que genera eventos de login (ver `lib/traffic-simulator.ts`).
- Recolección de métricas y cálculo de indicadores (ver `lib/metrics-collector.ts`, `lib/metrics-calculator.ts`).
- Detector ML basado en Isolation Forest (script: `scripts/isolation_forest_model.py` y endpoints bajo `app/api/ml/`).
- API REST simples en rutas de Next.js (carpeta `app/api`).
- Interfaz de administración/monitorización (componentes en `components/`).

## Estructura del repositorio (resumen)

- `app/` - Rutas de Next.js (API y páginas).
	- `app/api/` - Endpoints del backend (detección, métricas, ML, simulador, control, etc.).
- `components/` - Componentes React/TSX para el dashboard.
- `lib/` - Lógica del servidor: collector, detector, simulador y utilidades.
- `scripts/` - Scripts auxiliares (ej. `isolation_forest_model.py` para el modelo ML).
- `styles/`, `public/` - Recursos y estilos.

## Requisitos

- Node.js (recomendado 18+)
- pnpm (el proyecto usa pnpm, pero npm/yarn también pueden funcionar)
- Python 3.8+ para ejecutar/entrenar el script ML (si se usa localmente)

## Instalación y ejecución local

1. Instalar dependencias (PowerShell):

```pwsh
pnpm install
```

2. Ejecutar la aplicación en modo desarrollo:

```pwsh
pnpm dev
```

La aplicación Next.js quedará disponible típicamente en `http://localhost:3000`.

Si quieres ejecutar o entrenar el modelo ML localmente necesitarás Python y las dependencias de `scripts/isolation_forest_model.py` (scikit-learn, pandas, numpy, etc.). Por ejemplo:

```pwsh
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt  # si creas este archivo; de lo contrario instalar scikit-learn pandas numpy
python scripts/isolation_forest_model.py --help
```

## Endpoints principales (resumen)

Las rutas están implementadas en `app/api/`. Aquí algunos endpoints útiles:

- `GET  /api/metrics/status` - Estado del recolector de métricas.
- `POST /api/metrics/start-collector` - Inicia la recolección de métricas.
- `POST /api/metrics/stop-collector` - Detiene la recolección.
- `POST /api/ml/train` - Inicia entrenamiento del detector ML.
- `POST /api/ml/start-detector` - Arranca el detector en memoria.
- `POST /api/ml/stop-detector` - Detiene el detector.
- `POST /api/ml/detect` - Ruta para enviar datos y recibir detección de anomalías.
- `POST /api/simulator/start` - Inicia el generador de tráfico simulado.
- `GET  /api/simulator/status` - Consulta estado del simulador.

Consulta la carpeta `app/api/` para ver rutas específicas y parámetros esperados.

## Flujo típico de uso

1. (Opcional) Iniciar el simulador para generar eventos: `POST /api/simulator/start`.
2. Iniciar el colector de métricas: `POST /api/metrics/start-collector`.
3. Entrenar el detector ML (si es necesario): `POST /api/ml/train`.
4. Arrancar el detector: `POST /api/ml/start-detector`.
5. Enviar eventos para detectar anomalías con `POST /api/ml/detect`.

## ML: notas rápidas

- El script `scripts/isolation_forest_model.py` contiene lógica para entrenar y serializar un modelo Isolation Forest.
- Puedes utilizar ese script para entrenar con tus datos y guardar un artefacto que el servicio pueda cargar.
- Si planeas ejecutar entrenamiento localmente, instala scikit-learn y dependencias en un entorno virtual.

## Desarrollo y pruebas

- Código frontend en TypeScript/React (Next.js). Sigue las convenciones del proyecto y ejecuta `pnpm dev` para desarrollo.
- Para cambios en el backend (endpoints), reinicia el servidor de Next.js si no está en modo watch.

## Contribución

- Abre un issue para discutir cambios grandes.
- Envía Pull Requests con descripciones claras y pruebas cuando corresponda.

## Próximos pasos sugeridos / mejoras

- Añadir un `requirements.txt` para el entorno Python del modelo ML.
- Documentar ejemplos de payloads JSON para los endpoints principales.
- Integrar tests unitarios para la lógica del `lib/` (collector, detector).

## Licencia

Incluye aquí la licencia del proyecto (por ejemplo MIT) o remueve esta sección si no aplica.

---

Si quieres que escriba ejemplos concretos de payloads para los endpoints (`/api/ml/detect`, `/api/ml/train`, etc.), o que añada un `requirements.txt` y un pequeño script para entrenar y probar el modelo localmente, dime y lo agrego en el siguiente cambio.
