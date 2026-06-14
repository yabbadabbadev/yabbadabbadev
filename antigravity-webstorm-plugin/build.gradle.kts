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
        webstorm("2024.1")
        bundledPlugins("org.jetbrains.plugins.terminal")
        instrumentationTools()
    }
}

intellijPlatform {
    pluginConfiguration {
        name = "Antigravity CLI"
    }
}
