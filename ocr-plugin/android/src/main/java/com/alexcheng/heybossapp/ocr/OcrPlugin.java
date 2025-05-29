package com.alexcheng.heybossapp.ocr;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OCRPlugin")
public class OcrPlugin extends Plugin {

    @PluginMethod
    public void toggleFloatingBall(PluginCall call) {
        boolean enable = call.getBoolean("enable", false);
        String pkg = getContext().getPackageName();
        Intent intent = new Intent();
        intent.setClassName(pkg, pkg + ".FloatingBallService");

        if (enable) {
            // 请求或检查悬浮窗权限
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                && !Settings.canDrawOverlays(getContext())) {
                Intent perm = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + pkg)
                );
                perm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(perm);
            } else {
                // Android O+ 用 startForegroundService
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    getContext().startForegroundService(intent);
                } else {
                    getContext().startService(intent);
                }
            }
        } else {
            getContext().stopService(intent);
        }

        JSObject result = new JSObject();
        result.put("enabled", enable);
        call.resolve(result);
    }
}
