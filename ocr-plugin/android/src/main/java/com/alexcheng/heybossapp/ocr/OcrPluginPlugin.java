package com.alexcheng.heybossapp.ocr;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OCRPlugin")
public class OcrPluginPlugin extends Plugin {

    private final OcrPlugin implementation = new OcrPlugin();

    /**
     * 前端调用：开启/关闭悬浮球
     * calls: OCRPlugin.toggleFloatingBall({ enable: true|false })
     */
    @PluginMethod
    public void toggleFloatingBall(PluginCall call) {
        implementation.toggleFloatingBall(call);
    }
}
