package com.antigravity.plugin

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import org.jetbrains.plugins.terminal.TerminalToolWindowManager

class OpenAntigravityAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        
        try {
            // Try using modern 2024.1+ API
            val manager = TerminalToolWindowManager.getInstance(project)
            val widget = manager.createShellWidget(
                project.basePath ?: System.getProperty("user.home"),
                "Antigravity CLI",
                true,
                true
            )
            widget.sendCommandToExecute("agy")
        } catch (ex: Throwable) {
            // Fallback to classic Pre-2024.1 APIs reflection
            try {
                val terminalViewClass = Class.forName("org.jetbrains.plugins.terminal.TerminalView")
                val getInstance = terminalViewClass.getMethod("getInstance", Project::class.java)
                val instance = getInstance.invoke(null, project)
                val createLocalShellWidget = terminalViewClass.getMethod("createLocalShellWidget", String::class.java, String::class.java)
                val widget = createLocalShellWidget.invoke(instance, project.basePath ?: System.getProperty("user.home"), "Antigravity CLI")
                val executeCommand = widget.javaClass.getMethod("executeCommand", String::class.java)
                executeCommand.invoke(widget, "agy")
            } catch (fallbackEx: Throwable) {
                // If both fail, print to stdout or handle
                fallbackEx.printStackTrace()
                Messages.showErrorDialog(project, "Could not open Antigravity CLI", "Error")
            }
        }
    }
}
