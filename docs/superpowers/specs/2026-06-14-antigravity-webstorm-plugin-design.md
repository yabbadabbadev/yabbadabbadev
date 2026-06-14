# Design Document: Antigravity WebStorm Plugin

## Goal
Create an IntelliJ Platform plugin (targeting WebStorm and other IntelliJ IDEs) that adds an action to open the Terminal tool window and execute the `agy` command automatically in the current project context.

## Approaches

### Option A: Open Native Terminal Tab and Execute `agy` (Recommended)
This approach leverages the IDE's built-in Terminal. It opens a new terminal tab and runs `agy`. 
- **Pros**: It behaves exactly as the user requested ("del mismo modo que cuando abrimos un terminal y escribimos 'agy'"). Supports fully interactive shell features, CLI coloring, and input handling.
- **Cons**: Depends on the Terminal plugin APIs, which can change between platform versions.

### Option B: Custom Tool Window Running the `agy` Process
This approach spins up a custom tool window and manages the process output stream manually using the `Execution` API.
- **Pros**: Independent of JetBrains' terminal plugin implementation.
- **Cons**: Harder to implement, lacks full shell capabilities (history, autocomplete, shell aliases), and doesn't feel exactly like a native terminal tab.

**Decision**: Propose **Option A** as it matches the user's explicit request.

---

## Technical Architecture & Implementation

### Target Platform
- **IntelliJ Platform Version**: Target 2025.2+ (since the user runs modern WebStorm versions).
- **Language**: Kotlin.
- **Build Tool**: Gradle with the modern `intellij-platform-gradle-plugin`.

### Project Structure
We will create a subdirectory named `antigravity-webstorm-plugin/` with the following layout:
```text
antigravity-webstorm-plugin/
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
├── gradlew
├── gradle/wrapper/
│   ├── gradle-wrapper.jar
│   └── gradle-wrapper.properties
└── src/
    └── main/
        ├── kotlin/
        │   └── com/
        │       └── antigravity/
        │           └── plugin/
        │               └── OpenAntigravityAction.kt
        └── resources/
            └── META-INF/
                └── plugin.xml
```

### Core Code

#### 1. Action Implementation (`OpenAntigravityAction.kt`)
The action will extend `AnAction` and use `TerminalToolWindowManager` (available in modern platform versions) to start a terminal tab and run `agy`.

```kotlin
package com.antigravity.plugin

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import org.jetbrains.plugins.terminal.TerminalToolWindowManager

class OpenAntigravityAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        try {
            val manager = TerminalToolWindowManager.getInstance(project)
            val widget = manager.createShellWidget(
                null,                // Working directory (null defaults to project directory)
                "Antigravity CLI",   // Tab title
                true,                // Request focus
                true                 // Open in new tab
            )
            widget.sendCommandToExecute("agy")
        } catch (ex: Exception) {
            // Fallback for older versions or if modern API fails
            try {
                val terminalView = Class.forName("org.jetbrains.plugins.terminal.TerminalView")
                val getInstance = terminalView.getMethod("getInstance", com.intellij.openapi.project.Project::class.java)
                val instance = getInstance.invoke(null, project)
                val createLocalShellWidget = terminalView.getMethod("createLocalShellWidget", String::class.java, String::class.java)
                val widget = createLocalShellWidget.invoke(instance, project.basePath, "Antigravity CLI")
                val executeCommand = widget.javaClass.getMethod("executeCommand", String::class.java)
                executeCommand.invoke(widget, "agy")
            } catch (fallbackEx: Exception) {
                // Handle or log error
            }
        }
    }
}
```

#### 2. Configuration (`plugin.xml`)
Declares the plugin details, dependencies, and registers the action under the Tools menu and as a toolbar item.

```xml
<idea-plugin>
    <id>com.antigravity.plugin</id>
    <name>Antigravity CLI</name>
    <vendor email="support@antigravity.com" url="https://antigravity.com">Antigravity</vendor>

    <description><![CDATA[
    Opens the Antigravity CLI (agy) in a native WebStorm terminal tab.
    ]]></description>

    <depends>com.intellij.modules.platform</depends>
    <depends>org.jetbrains.plugins.terminal</depends>

    <actions>
        <action id="com.antigravity.plugin.OpenAntigravityAction"
                class="com.antigravity.plugin.OpenAntigravityAction"
                text="Open Antigravity CLI"
                description="Open Antigravity CLI in a terminal tab">
            <add-to-group group-id="ToolsMenu" anchor="last"/>
            <keyboard-shortcut keymap="$default" first-keystroke="shift alt A"/>
        </action>
    </actions>
</idea-plugin>
```

#### 3. Build File (`build.gradle.kts`)
Uses the modern Kotlin DSL with `org.jetbrains.intellij.platform` plugin.

```kotlin
plugins {
    id("org.jetbrains.kotlin.jvm") version "1.9.22"
    id("org.jetbrains.intellij.platform") version "2.0.1"
}

group = "com.antigravity.plugin"
version = "1.0.0"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        webStorm("2024.1") // Target baseline compatibility
        bundledPlugins("org.jetbrains.plugins.terminal")
        instrumentationTools()
    }
}

intellijPlatform {
    pluginConfiguration {
        name = "Antigravity CLI"
    }
}
```

---
## Deliverables
- Fully generated project files under `/Users/alex/Dev/yabbadabbadev/antigravity-webstorm-plugin`.
- Compiled plugin ZIP located in `/Users/alex/Dev/yabbadabbadev/antigravity-webstorm-plugin/build/distributions/`.
