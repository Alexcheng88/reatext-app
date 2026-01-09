package com.reatext.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginResult;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ✅ 处理 PDF 文件 intent
        handlePDFIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handlePDFIntent(intent); // 如果是已在运行状态，也能接收到新 intent
    }

    private void handlePDFIntent(Intent intent) {
        Uri pdfUri = intent.getData();
        if (pdfUri != null) {
            String pdfPath = pdfUri.toString();
            Log.d("MainActivity", "Received PDF URI: " + pdfPath);

            // ✅ 将 PDF 路径发送到 WebView（前端）
            // 页面需监听 window.addEventListener('message', ...)
            bridge.getWebView().post(() -> {
                String js = "window.dispatchEvent(new CustomEvent('pdfReceived', { detail: { uri: '" + pdfPath + "' }}));";
                bridge.getWebView().evaluateJavascript(js, null);
            });
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopService(new Intent(this, FloatingBallService.class));
    }
}
