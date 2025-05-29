package com.reatext.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.os.Bundle;
import com.reatext.app.R;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

   @Override
   protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);

       // 不再自动启动悬浮球
   }
    // onCreate 中不再自动启动悬浮球

    @Override
    public void onDestroy() {
        super.onDestroy();
        // App 退出时，确保浮球服务停止
        stopService(new Intent(this, FloatingBallService.class));
    }
}
