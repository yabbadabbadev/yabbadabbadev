# AI Agent Guidelines & Ground Rules

Este archivo proporciona directrices críticas para cualquier agente de IA que trabaje en este repositorio. Estas instrucciones anulan comportamientos predeterminados y deben seguirse estrictamente.

---

## 1. Comandos de Verificación
Antes de dar cualquier tarea por completada o afirmar que todo funciona, debes ejecutar:
- **Pruebas unitarias**: `npm test -- --run`
- **Linting & Type-checking**: `npm run lint` y `npm run build`

---

## 2. Decision Guards (DECISIONS.md)
- Si encuentras un comentario con el prefijo `// DEC-XXX` en cualquier archivo, **DEBES** leer su entrada correspondiente en `DECISIONS.md` antes de sugerir, editar o refactorizar el código asociado.
- Al introducir intencionalmente una solución no convencional o un trade-off de diseño crítico (ej. rendimiento, hacks de compatibilidad), crea una entrada en `DECISIONS.md` y añade el comentario inline correspondiente en el código.

---

## 3. Normas de Calidad de Código y Estructura

### 3.1. TypeScript Estricto
- Todo componente, función o hook debe tener declaraciones de tipos explícitas para sus parámetros y tipo de retorno.
- Evita el uso de `any`. Si es absolutamente necesario, justifica su uso o decláralo como `unknown` y realiza estrechamiento de tipos (type narrowing).

### 3.2. Desarrollo Orientado a Pruebas (TDD)
- Sigue la metodología **Red-Green-Refactor**:
  1. Crea o modifica un test unitario/integración en `src/__tests__/` que falle para representar el cambio deseado.
  2. Escribe el código mínimo necesario en `src/` para hacer pasar el test.
  3. Refactoriza el código asegurándote de que la suite siga en verde.

### 3.3. Mocking con MSW (Mock Service Worker)
- No realices peticiones de red reales en los entornos de prueba.
- Todo mock de APIs de red debe residir en `src/mocks/handlers.ts`. Registra nuevos controladores allí.

### 3.4. Arquitectura de Componentes
- **Single Responsibility Principle**: Mantén los componentes pequeños y enfocados en una sola función visual o lógica.
- **Custom Hooks**: Extrae los efectos (`useEffect`), estados complejos o integraciones de APIs en custom hooks separados (ej. `src/hooks/useData.ts`).
- **Límite de tamaño**: Los archivos de componentes React no deben exceder las 150 líneas de código. Si crecen más, sepáralos en subcomponentes o custom hooks.

---

## 4. Gestión de Contexto de IA
- Para tareas complejas, utiliza `docs/superpowers/specs/` para diseñar y validar especificaciones de diseño con el usuario humano antes de escribir código de implementación.
- Utiliza `docs/superpowers/plans/` para escribir y seguir planes de implementación paso a paso.
- Extrae conocimiento útil o correcciones que surjan durante la sesión en documentos de conocimiento (`docs/`) si consideras que pueden ser útiles en futuras sesiones.
