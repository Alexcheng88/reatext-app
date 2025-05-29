// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "OcrPlugin",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "OcrPlugin",
            targets: ["OcrPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "OcrPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/OcrPluginPlugin"),
        .testTarget(
            name: "OcrPluginPluginTests",
            dependencies: ["OcrPluginPlugin"],
            path: "ios/Tests/OcrPluginPluginTests")
    ]
)